import { ORIGINAL, ALTERNATIVES } from "../data/medicines"
import allMedicines from "../data/allMedicines.json"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

const USE_BACKEND = true

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

function cleanText(str) {
  if (!str || typeof str !== 'string') return str
  return str
    .replace(/Â/g, '')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/Ã©/g, 'é')
    .replace(/\u00c2/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Converts plain text to safe HTML for dangerouslySetInnerHTML
function textToHtml(str) {
  if (!str || typeof str !== 'string') return '<p>No information available.</p>'
  const cleaned = cleanText(str)
  // Split on double newlines for paragraphs, single newlines for <br>
  const paragraphs = cleaned.split(/\n{2,}/)
  if (paragraphs.length === 1) {
    // Long single-paragraph text: break at ~80 words into paragraphs
    const words = cleaned.split(' ')
    const chunks = []
    for (let i = 0; i < words.length; i += 80) {
      chunks.push(words.slice(i, i + 80).join(' '))
    }
    return chunks.map(p => `<p>${p}</p>`).join('')
  }
  return paragraphs.map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')
}

// Maps backend field names → frontend field names
function mapMed(m) {
  if (!m) return null
  return {
    ...m,
    name:         cleanText(m.product_name),
    salt:         cleanText(m.salt_composition),
    form:         m.dosage_form || "Tablet",
    pack:         m.sub_category || m.dosage_form || "Strip",
    desc:         textToHtml(m.description || m.uses || "No description available."),
    sideEffects:  textToHtml(m.side_effects || "No side effect data available."),
    price:        m.price ? Number(m.price) : null,
    priceLabel:   m.price ? `₹${Number(m.price).toFixed(2)}` : "N/A",
    priceSub:     "per strip",
    interactions: Array.isArray(m.interactions_parsed)
      ? m.interactions_parsed.map(i => ({
          drug:  cleanText(i.drug  || i.name  || "Unknown"),
          brand: cleanText(i.brand || i.brands || ""),
          level: i.level || i.severity || "Moderate",
        }))
      : [],
    reviews: {
      excellent: m.review_excellent_pct || 0,
      average:   m.review_average_pct   || 0,
      poor:      m.review_poor_pct      || 0,
    },
    interactionCount: m.drug_interaction_count || 0,
    available:        !m.is_discontinued,
    category:         m.sub_category || "",
  }
}

// Search
export async function searchMedicine(query) {
  if (!USE_BACKEND) {
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
      .slice(0, 10)
    return { medicine: match, alternatives }
  }
  const data = await get(`/search/${encodeURIComponent(query)}`)
  return {
    medicine:     mapMed(data.medicine),
    alternatives: (data.alternatives || []).map(mapMed),
  }
}

export async function getMedicine(id) {
  if (!USE_BACKEND) return ORIGINAL
  const data = await get(`/medicine/${id}`)
  return mapMed(data)
}

export async function getAlternatives(id) {
  if (!USE_BACKEND) return ALTERNATIVES
  const data = await get(`/alternatives/${id}`)
  return (data.alternatives || []).map(mapMed)
}

export async function analyzeImage(formData) {
  if (!USE_BACKEND) {
    await new Promise(r => setTimeout(r, 2800))
    return {
      extracted:    "Augmentin 625 Duo Tablet\nAmoxycillin 500mg + Clavulanic Acid 125mg\nGlaxo SmithKline Pharmaceuticals",
      confidence:   91,
      medicine:     ORIGINAL,
      alternatives: ALTERNATIVES,
    }
  }
  const res = await fetch(`${BASE}/image/analyze`, { method: "POST", body: formData })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Image analysis failed")
  }
  const data = await res.json()
  return {
    extracted:    data.extracted || "",
    confidence:   data.confidence || 0,
    query_used:   data.query_used || "",
    medicine:     mapMed(data.medicine),
    alternatives: (data.alternatives || []).map(mapMed),
  }
}

export async function getAutoComplete(query) {
  if (!USE_BACKEND || !query || query.length < 2) return []
  try {
    const data = await get(`/autocomplete/${encodeURIComponent(query)}`)
    return data.suggestions || []
  } catch(err) {
    console.error('Autocomplete fetch error:', err)
    return []
  }
}
