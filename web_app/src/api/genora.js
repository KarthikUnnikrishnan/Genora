import { ORIGINAL, ALTERNATIVES } from "../data/medicines"
import allMedicines from "../data/allMedicines.json"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

const USE_BACKEND = false

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export async function searchMedicine(query) {
  if (!USE_BACKEND) {
    await new Promise(r => setTimeout(r, 500))
    if (!query.trim()) return null
    
    const q = query.toLowerCase().trim()
    
    // Find the best match by name
    const match = allMedicines.find(m =>
      m.name?.toLowerCase().includes(q) ||
      m.salt?.toLowerCase().includes(q)
    )
    
    if (!match) return null
    
    // Find ALL medicines with the same salt (these are the alternatives)
    const salt = match.salt
    const alternatives = allMedicines
      .filter(m => m.salt === salt && m.id !== match.id)
      .sort((a, b) => (a.price || 999) - (b.price || 999))
      .slice(0, 6)
      
    console.log("alternatives found:", alternatives.length)
      
    return { medicine: match, alternatives }
  }
  const data = await get(`/search/${encodeURIComponent(query)}`)
  const alts = data.id ? await get(`/alternatives/${data.id}`) : []
  return { medicine: data, alternatives: alts }
}

export async function getMedicine(id) {
  if (!USE_BACKEND) return ORIGINAL
  return get(`/medicine/${id}`)
}

export async function getAlternatives(id) {
  if (!USE_BACKEND) return ALTERNATIVES
  return get(`/alternatives/${id}`)
}

export async function analyzeImage(formData) {
  if (!USE_BACKEND) {
    await new Promise(r => setTimeout(r, 2800))
    return {
      extracted: "Augmentin 625 Duo Tablet\nAmoxycillin 500mg + Clavulanic Acid 125mg\nGlaxo SmithKline Pharmaceuticals",
      confidence: 91,
      medicine: ORIGINAL,
      alternatives: ALTERNATIVES,
    }
  }
  const res = await fetch(`${BASE}/image/analyze`, { method: "POST", body: formData })
  if (!res.ok) throw new Error("Image analysis failed")
  return res.json()
}
