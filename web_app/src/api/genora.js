import { ORIGINAL, ALTERNATIVES } from "../data/medicines"
import allMedicines from "../data/allMedicines.json"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

const USE_BACKEND = true

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

// ── Maps backend field names → frontend field names ──────────────────────────
function mapMed(m) {
  if (!m) return null
  return {
    ...m,
    // Core display fields
    name: m.product_name,
    salt: m.salt_composition,
    form: m.dosage_form || "Tablet",
    pack: m.dosage_form || "Strip",
    desc: m.description || m.uses || "No description available.",
    sideEffects: m.side_effects || "No side effect data available.",
    // Price
    price: m.price ? Number(m.price) : null,
    priceLabel: m.price ? `₹${Number(m.price).toFixed(2)}` : "N/A",
    priceSub: "per strip",
    // Interactions — already parsed by backend
    interactions: Array.isArray(m.interactions_parsed)
      ? m.interactions_parsed.map(i => ({
        drug: i.drug || i.name || "Unknown",
        brand: i.brand || i.brands || "",
        level: i.level || i.severity || "Moderate",
      }))
      : [],
    // Reviews
    reviews: {
      excellent: m.review_excellent_pct || 0,
      average: m.review_average_pct || 0,
      poor: m.review_poor_pct || 0,
    },
    // Other
    interactionCount: m.drug_interaction_count || 0,
    available: !m.is_discontinued,
    category: m.sub_category || "",
  }
}

// ── Search ────────────────────────────────────────────────────────────────────
export async function searchMedicine(query) {
  if (!USE_BACKEND) {
    // Offline fallback — search allMedicines.json
    await new Promise(r => setTimeout(r, 400))
    if (!query.trim()) return null

    const q = query.toLowerCase().trim()

    const match = allMedicines.find(m =>
      m.name?.toLowerCase().includes(q) ||
      m.salt?.toLowerCase().includes(q)
    )

    if (!match) return null

    const alternatives = allMedicines
      .filter(m => m.salt === match.salt && m.id !== match.id)
      .sort((a, b) => (a.price || 999) - (b.price || 999))
      .slice(0, 6)

    return { medicine: match, alternatives }
  }

  // Live backend
  const data = await get(`/search/${encodeURIComponent(query)}`)

  return {
    medicine: mapMed(data.medicine),
    alternatives: (data.alternatives || []).map(mapMed),
  }
}

// ── Get single medicine ───────────────────────────────────────────────────────
export async function getMedicine(id) {
  if (!USE_BACKEND) return ORIGINAL
  const data = await get(`/medicine/${id}`)
  return mapMed(data)
}

// ── Get alternatives ──────────────────────────────────────────────────────────
export async function getAlternatives(id) {
  if (!USE_BACKEND) return ALTERNATIVES
  const data = await get(`/alternatives/${id}`)
  return (data.alternatives || []).map(mapMed)
}

// ── Image analysis ────────────────────────────────────────────────────────────
export async function analyzeImage(formData) {
  if (!USE_BACKEND) {
    // Fake demo — remove once EasyOCR is installed
    await new Promise(r => setTimeout(r, 2800))
    return {
      extracted: "Augmentin 625 Duo Tablet\nAmoxycillin 500mg + Clavulanic Acid 125mg\nGlaxo SmithKline Pharmaceuticals",
      confidence: 91,
      medicine: ORIGINAL,
      alternatives: ALTERNATIVES,
    }
  }

  const res = await fetch(`${BASE}/image/analyze`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Image analysis failed")
  }

  const data = await res.json()

  return {
    extracted: data.extracted || "",
    confidence: data.confidence || 0,
    query_used: data.query_used || "",
    medicine: mapMed(data.medicine),
    alternatives: (data.alternatives || []).map(mapMed),
  }
}