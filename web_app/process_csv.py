import csv
import json
import os
import re

def clean_text(text):
    if not text: return ""
    # Map the artifacts from the user's prompt
    text = text.replace('Â', '')
    text = text.replace('â€™', "'")
    text = text.replace('â€œ', '"')
    text = text.replace('â€', '"')
    text = text.replace('Ã©', 'é')
    text = text.replace('\xa0', ' ')
    return text.strip()

csv_path = r"D:\Coding Section\Genora\dataset\master_medicines_fixed.csv"
output_path = r"D:\Coding Section\Genora\web_app\src\data\allMedicines.json"

medicines = []
id_counter = 0

with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        interactions = []
        try:
            di_raw = row['drug_interactions']
            if di_raw:
                di = json.loads(di_raw.replace('""', '"'))
                if type(di) == str:
                    di = json.loads(di)
                drug_list = di.get("drug", [])
                brand_list = di.get("brand", [])
                effect_list = di.get("effect", [])
                for i in range(len(drug_list)):
                    interactions.append({
                        "drug": clean_text(drug_list[i]) if i < len(drug_list) else "",
                        "brand": clean_text(brand_list[i]) if i < len(brand_list) else "",
                        "level": clean_text(effect_list[i]).capitalize() if i < len(effect_list) else "Moderate"
                    })
        except Exception as e:
            pass
            
        try:
            reviews = {
                "excellent": int(float(row['review_excellent_pct'] or 0)),
                "average": int(float(row['review_average_pct'] or 0)),
                "poor": int(float(row['review_poor_pct'] or 0))
            }
        except:
            reviews = {"excellent": 0, "average": 0, "poor": 0}

        try:
            price = float(row['price'])
        except:
            price = 0.0

        id_counter += 1
        med = {
            "id": id_counter,
            "name": clean_text(row['product_name']),
            "category": clean_text(row['sub_category']),
            "salt": clean_text(row['salt_composition']),
            "form": clean_text(row['dosage_form']),
            "price": price,
            "priceLabel": f"₹{price:.2f}",
            "priceSub": "per strip", 
            "manufacturer": clean_text(row['manufacturer']),
            "available": row['price_available'].lower() == 'true' if row['price_available'] else True,
            "desc": clean_text(row['description']).replace("\n", "<br/>"),
            "uses": clean_text(row['uses']),
            "sideEffects": clean_text(row['side_effects']),
            "interactions": interactions,
            "interactionCount": int(row['drug_interaction_count'] or 0),
            "imageUrl": row['image_url'],
            "reviews": reviews,
            "pack": "Strip"
        }
        medicines.append(med)

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(medicines, f)

print(f"Generated {output_path} with {len(medicines)} medicines.")
