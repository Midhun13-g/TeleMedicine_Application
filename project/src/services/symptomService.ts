interface SymptomResult {
  disease: string;
  match_score: number;
  matched_symptoms: string[];
}

interface SymptomRequest {
  symptoms: string[];
}

interface SymptomResponse {
  possible_conditions: SymptomResult[];
}

class SymptomService {
  private baseUrl = 'http://localhost:8081/api/symptoms';
  
  // Local dataset for offline functionality
  private localDataset: Record<string, string[]> = {
    "Fungal infection": ["itching", "dischromic_patches", "nodal_skin_eruptions", "skin_rash"],
    "Allergy": ["chills", "shivering", "continuous_sneezing", "watering_from_eyes"],
    "GERD": ["cough", "stomach_pain", "ulcers_on_tongue", "chest_pain", "acidity", "vomiting"],
    "Chronic cholestasis": ["yellowish_skin", "itching", "loss_of_appetite", "abdominal_pain", "nausea", "yellowing_of_eyes", "vomiting"],
    "Drug Reaction": ["stomach_pain", "itching", "skin_rash", "burning_micturition", "spotting_urination"],
    "Peptic ulcer disease": ["loss_of_appetite", "abdominal_pain", "indigestion", "passage_of_gases", "vomiting", "internal_itching"],
    "Diabetes": ["blurred_and_distorted_vision", "fatigue", "polyuria", "weight_loss", "obesity", "restlessness", "lethargy", "excessive_hunger", "irregular_sugar_level", "increased_appetite"],
    "Gastroenteritis": ["dehydration", "diarrhoea", "vomiting", "sunken_eyes"],
    "Bronchial Asthma": ["family_history", "fatigue", "cough", "breathlessness", "mucoid_sputum", "high_fever"],
    "Hypertension": ["headache", "dizziness", "loss_of_balance", "chest_pain", "lack_of_concentration"],
    "Migraine": ["blurred_and_distorted_vision", "headache", "depression", "visual_disturbances", "stiff_neck", "indigestion", "irritability", "acidity", "excessive_hunger"],
    "Malaria": ["chills", "diarrhoea", "headache", "muscle_pain", "nausea", "high_fever", "vomiting", "sweating"],
    "Chicken pox": ["fatigue", "headache", "itching", "swelled_lymph_nodes", "loss_of_appetite", "red_spots_over_body", "malaise", "skin_rash", "lethargy", "high_fever", "mild_fever"],
    "Dengue": ["chills", "fatigue", "high_fever", "headache", "pain_behind_the_eyes", "muscle_pain", "back_pain", "loss_of_appetite", "nausea", "red_spots_over_body", "malaise", "skin_rash", "joint_pain", "vomiting"],
    "Common Cold": ["chills", "congestion", "loss_of_smell", "continuous_sneezing", "fatigue", "headache", "throat_irritation", "cough", "runny_nose", "swelled_lymph_nodes", "muscle_pain", "redness_of_eyes", "malaise", "chest_pain", "phlegm", "high_fever", "sinus_pressure"],
    "Pneumonia": ["chills", "fast_heart_rate", "fatigue", "cough", "breathlessness", "malaise", "chest_pain", "rusty_sputum", "phlegm", "high_fever", "sweating"],
    "Heart attack": ["breathlessness", "chest_pain", "vomiting", "sweating"],
    "Hypothyroidism": ["mood_swings", "fatigue", "depression", "brittle_nails", "enlarged_thyroid", "swollen_extremeties", "abnormal_menstruation", "puffy_face_and_eyes", "dizziness", "irritability", "weight_gain", "cold_hands_and_feets", "lethargy"],
    "Hyperthyroidism": ["diarrhoea", "mood_swings", "fatigue", "fast_heart_rate", "weight_loss", "abnormal_menstruation", "irritability", "restlessness", "excessive_hunger", "muscle_weakness", "sweating"],
    "Urinary tract infection": ["continuous_feel_of_urine", "foul_smell_of_urine", "bladder_discomfort", "burning_micturition"]
  };

  private normalizeSymptom(symptom: string): string {
    return symptom.toLowerCase().trim().replace(/\s+/g, '_');
  }

  private checkSymptomsLocal(userSymptoms: string[]): SymptomResult[] {
    const normalizedSymptoms = userSymptoms.map(s => this.normalizeSymptom(s));
    const results: SymptomResult[] = [];

    for (const [disease, diseaseSymptoms] of Object.entries(this.localDataset)) {
      const overlap = normalizedSymptoms.filter(userSymptom => 
        diseaseSymptoms.some(diseaseSymptom => {
          // Direct match
          if (diseaseSymptom === userSymptom) return true;
          
          // Partial match (contains)
          if (diseaseSymptom.includes(userSymptom) || userSymptom.includes(diseaseSymptom)) return true;
          
          // Space/underscore normalized match
          const normalizedDiseaseSymptom = diseaseSymptom.replace(/_/g, ' ');
          const normalizedUserSymptom = userSymptom.replace(/_/g, ' ');
          
          return normalizedDiseaseSymptom.includes(normalizedUserSymptom) || 
                 normalizedUserSymptom.includes(normalizedDiseaseSymptom);
        })
      );
      
      if (overlap.length > 0) {
        const score = overlap.length / diseaseSymptoms.length;
        results.push({
          disease,
          match_score: Math.round(score * 100) / 100, // Round to 2 decimal places
          matched_symptoms: overlap
        });
      }
    }

    return results.sort((a, b) => b.match_score - a.match_score).slice(0, 5);
  }

  async checkSymptoms(symptoms: string[]): Promise<SymptomResult[]> {
    if (!symptoms || symptoms.length === 0) {
      throw new Error('No symptoms provided');
    }

    try {
      // Try backend API first
      const response = await fetch(`${this.baseUrl}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms } as SymptomRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SymptomResponse = await response.json();
      return data.possible_conditions;
    } catch (error) {
      console.warn('Backend API unavailable, using local dataset:', error);
      // Fallback to local processing
      return this.checkSymptomsLocal(symptoms);
    }
  }

  // Get common symptoms for quick selection
  getCommonSymptoms(): string[] {
    return [
      'fever', 'headache', 'cough', 'fatigue', 'nausea', 'vomiting',
      'diarrhea', 'chest_pain', 'abdominal_pain', 'muscle_pain',
      'joint_pain', 'skin_rash', 'dizziness', 'breathlessness',
      'sore_throat', 'runny_nose', 'body_ache', 'loss_of_appetite'
    ];
  }

  // Get symptom suggestions based on partial input
  getSuggestions(partialSymptom: string): string[] {
    if (!partialSymptom || partialSymptom.length < 2) return [];
    
    const normalized = this.normalizeSymptom(partialSymptom);
    const suggestions = new Set<string>();
    
    // Search through all symptoms in the dataset
    Object.values(this.localDataset).forEach(symptoms => {
      symptoms.forEach(symptom => {
        if (symptom.includes(normalized) || normalized.includes(symptom)) {
          suggestions.add(symptom.replace(/_/g, ' '));
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 10);
  }
}

export const symptomService = new SymptomService();
export type { SymptomResult, SymptomRequest, SymptomResponse };