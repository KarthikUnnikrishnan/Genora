import allMedicines from "./allMedicines.json"

export const ORIGINAL = allMedicines.find(m => m.name.toLowerCase() === "augmentin 625 duo tablet") || allMedicines[0]

let _alts = []
if (ORIGINAL) {
  _alts = allMedicines
    .filter(m => m.salt === ORIGINAL.salt && m.id !== ORIGINAL.id && m.price > 0)
    .sort((a, b) => a.price - b.price)
    .slice(0, 6)
    .map((m, i) => ({
      ...m,
      num: `#0${i+1}`,
      save: ORIGINAL.price > m.price ? `SAVE ₹${(ORIGINAL.price - m.price).toFixed(2)}` : `EXTRA ₹${(m.price - ORIGINAL.price).toFixed(2)}`,
      best: i === 0,
    }))
}

export const ALTERNATIVES = _alts

export const STATS = [
  { num: 7466, label: "Medicines Indexed" },
  { num: 12675, label: "Ingredient Records" },
  { num: 49, label: "Dosage Forms" },
  { num: 3, label: "AI Scan Modes" },
]

export const SUGGESTIONS = [
  "Paracetamol",
  "Azithromycin",
  "Metformin",
  "Pantoprazole",
  "Amoxicillin",
]

export const PRESC_MEDICINES = [
  { name: "Augmentin 625 Tablet", salt: "Amoxycillin + Clavulanic Acid", alts: "6 alternatives", price: "₹223.42" },
  { name: "Pantoprazole 40mg", salt: "Pantoprazole (40mg)", alts: "12 alternatives", price: "₹98.00" },
  { name: "Metformin 500mg", salt: "Metformin HCl (500mg)", alts: "18 alternatives", price: "₹42.50" },
  { name: "Atorvastatin 10mg", salt: "Atorvastatin (10mg)", alts: "9 alternatives", price: "₹75.00" },
]
