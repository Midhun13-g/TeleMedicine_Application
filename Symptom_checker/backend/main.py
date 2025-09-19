from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import difflib

# Load dataset
df = pd.read_csv("data/dataset.csv")

# Build dictionary: { disease: [symptoms] }
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

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SymptomRequest(BaseModel):
    symptoms: list[str]

@app.post("/api/check")
def check_symptoms(req: SymptomRequest):
    user_symptoms = [s.strip().lower().replace(" ", "_") for s in req.symptoms]
    results = []

    for disease, symptoms in disease_symptom_map.items():
        overlap = set()
        for user_sym in user_symptoms:
            # Find closest match (if any) in dataset symptoms
            match = difflib.get_close_matches(user_sym, symptoms, n=1, cutoff=0.6)
            if match:
                overlap.add(match[0])

        if overlap:
            score = len(overlap) / len(symptoms)
            results.append({
                "disease": disease,
                "match_score": round(score, 2),
                "matched_symptoms": list(overlap)
            })

    results = sorted(results, key=lambda x: x["match_score"], reverse=True)
    return {"possible_conditions": results[:5]}
