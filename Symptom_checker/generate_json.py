import pandas as pd
import json

# Load dataset
df = pd.read_csv("backend/data/dataset.csv")

# Build dictionary { disease: [symptoms] }
disease_symptom_map = {}
for _, row in df.iterrows():
    disease = row["Disease"]
    symptoms = [
        str(val).strip().lower().replace(" ", "_")
        for val in row[1:].dropna().tolist()
    ]
    if disease not in disease_symptom_map:
        disease_symptom_map[disease] = set()
    disease_symptom_map[disease].update(symptoms)

# Convert sets → lists
disease_symptom_map = {k: list(v) for k, v in disease_symptom_map.items()}

# Save JSON to frontend folder
with open("frontend/dataset.json", "w") as f:
    json.dump(disease_symptom_map, f, indent=2)

print("✅ dataset.json created in frontend/")
