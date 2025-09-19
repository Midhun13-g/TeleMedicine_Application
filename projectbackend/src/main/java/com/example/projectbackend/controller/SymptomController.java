package com.example.projectbackend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/symptoms")
@CrossOrigin(origins = "*")
public class SymptomController {

    // Simple in-memory dataset for demonstration
    private final Map<String, List<String>> diseaseSymptomMap = new HashMap<String, List<String>>() {{
        put("Common Cold", Arrays.asList("chills", "congestion", "loss_of_smell", "continuous_sneezing", "fatigue", "headache", "throat_irritation", "cough", "runny_nose", "muscle_pain"));
        put("Fever", Arrays.asList("high_fever", "chills", "sweating", "headache", "muscle_pain", "fatigue"));
        put("Migraine", Arrays.asList("headache", "nausea", "visual_disturbances", "sensitivity_to_light", "vomiting"));
        put("Hypertension", Arrays.asList("headache", "dizziness", "chest_pain", "shortness_of_breath"));
        put("Diabetes", Arrays.asList("excessive_thirst", "frequent_urination", "fatigue", "blurred_vision", "weight_loss"));
        put("Gastroenteritis", Arrays.asList("nausea", "vomiting", "diarrhea", "abdominal_pain", "fever"));
    }};

    @PostMapping("/check")
    public ResponseEntity<Map<String, Object>> checkSymptoms(@RequestBody Map<String, List<String>> request) {
        List<String> userSymptoms = request.get("symptoms");
        
        if (userSymptoms == null || userSymptoms.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No symptoms provided"));
        }

        List<Map<String, Object>> results = new ArrayList<>();
        
        for (Map.Entry<String, List<String>> entry : diseaseSymptomMap.entrySet()) {
            String disease = entry.getKey();
            List<String> diseaseSymptoms = entry.getValue();
            
            List<String> matchedSymptoms = userSymptoms.stream()
                .filter(symptom -> diseaseSymptoms.stream()
                    .anyMatch(ds -> ds.toLowerCase().contains(symptom.toLowerCase()) || 
                                   symptom.toLowerCase().contains(ds.toLowerCase())))
                .collect(Collectors.toList());
            
            if (!matchedSymptoms.isEmpty()) {
                double score = (double) matchedSymptoms.size() / diseaseSymptoms.size();
                
                Map<String, Object> result = new HashMap<>();
                result.put("disease", disease);
                result.put("match_score", Math.round(score * 100.0) / 100.0);
                result.put("matched_symptoms", matchedSymptoms);
                
                results.add(result);
            }
        }
        
        // Sort by match score descending
        results.sort((a, b) -> Double.compare((Double) b.get("match_score"), (Double) a.get("match_score")));
        
        // Return top 5 results
        List<Map<String, Object>> topResults = results.stream().limit(5).collect(Collectors.toList());
        
        return ResponseEntity.ok(Map.of("possible_conditions", topResults));
    }

    @GetMapping("/common")
    public ResponseEntity<List<String>> getCommonSymptoms() {
        List<String> commonSymptoms = Arrays.asList(
            "fever", "headache", "cough", "fatigue", "nausea", "vomiting",
            "diarrhea", "chest_pain", "abdominal_pain", "muscle_pain",
            "joint_pain", "skin_rash", "dizziness", "breathlessness"
        );
        return ResponseEntity.ok(commonSymptoms);
    }
}