# Symptom Checker Integration

## Overview
The Symptom Checker has been successfully integrated into your TeleMedicine Application with the following features:

### ✅ Completed Integration

1. **Frontend Components**
   - `SymptomChecker.tsx` - Main symptom checker component
   - `SymptomCheckerPage.tsx` - Dedicated page with chat and history
   - Integrated into `PatientDashboard.tsx` symptoms tab
   - Service layer (`symptomService.ts`) for API communication

2. **Backend API**
   - Spring Boot controller (`SymptomController.java`)
   - RESTful endpoints for symptom checking
   - CORS enabled for frontend communication
   - Security configuration updated

3. **Features Implemented**
   - AI-powered symptom analysis
   - Offline functionality with local dataset
   - Quick symptom selection buttons
   - Match scoring and ranking
   - Integration with appointment booking
   - Chat interface for health guidance
   - History tracking of symptom checks

## How to Use

### 1. Start the Application
```bash
# Option 1: Use the provided batch script
start-symptom-checker.bat

# Option 2: Manual startup
# Terminal 1 - Backend
cd projectbackend
mvnw spring-boot:run

# Terminal 2 - Frontend  
cd project
npm run dev
```

### 2. Access Symptom Checker

#### In Patient Dashboard:
1. Login as a patient
2. Navigate to "Symptoms" tab
3. Use the integrated symptom checker
4. Or click "Open Symptom Checker" for full experience

#### Features Available:
- **Quick Symptom Entry**: Type symptoms or use quick-add buttons
- **AI Analysis**: Get possible condition matches with confidence scores
- **Appointment Booking**: Direct integration with booking system
- **Chat Interface**: Discuss results with AI assistant
- **History Tracking**: View previous symptom checks

### 3. API Endpoints

#### Backend Endpoints:
- `POST /api/symptoms/check` - Analyze symptoms
- `GET /api/symptoms/common` - Get common symptoms list

#### Request Format:
```json
{
  "symptoms": ["fever", "headache", "cough"]
}
```

#### Response Format:
```json
{
  "possible_conditions": [
    {
      "disease": "Common Cold",
      "match_score": 0.75,
      "matched_symptoms": ["fever", "headache", "cough"]
    }
  ]
}
```

## Technical Details

### Frontend Architecture
- **React + TypeScript** components
- **Service layer** for API abstraction
- **Offline fallback** using local dataset
- **Toast notifications** for user feedback
- **Responsive design** with Tailwind CSS

### Backend Architecture
- **Spring Boot** REST API
- **In-memory dataset** for quick responses
- **CORS enabled** for frontend integration
- **Security configured** for public access

### Data Flow
1. User enters symptoms in frontend
2. Frontend calls symptom service
3. Service tries backend API first
4. If backend unavailable, uses local dataset
5. Results displayed with match scores
6. User can book appointments or chat about results

## Customization

### Adding New Diseases/Symptoms
1. **Frontend**: Update `localDataset` in `symptomService.ts`
2. **Backend**: Update `diseaseSymptomMap` in `SymptomController.java`

### Styling
- Components use your existing UI library
- Tailwind classes for consistent styling
- Medical theme colors and icons

### Integration Points
- **Appointment Booking**: Connected to existing booking system
- **User Authentication**: Uses existing auth context
- **Language Support**: Integrated with language context
- **Toast Notifications**: Uses existing toast system

## File Structure
```
project/
├── src/
│   ├── components/
│   │   ├── SymptomChecker.tsx
│   │   └── dashboards/PatientDashboard.tsx (updated)
│   ├── pages/
│   │   └── SymptomCheckerPage.tsx
│   └── services/
│       └── symptomService.ts
│
projectbackend/
├── src/main/java/com/example/projectbackend/
│   ├── controller/
│   │   └── SymptomController.java
│   └── config/
│       └── SecurityConfig.java (updated)
│
Symptom_checker/ (original - preserved)
├── frontend/
│   ├── index.html
│   └── dataset.json
└── backend/
    ├── main.py
    └── requirements.txt
```

## Next Steps

1. **Test the Integration**
   - Run both backend and frontend
   - Test symptom checking functionality
   - Verify offline mode works

2. **Enhance Features** (Optional)
   - Add more diseases to dataset
   - Implement symptom suggestions
   - Add severity assessment
   - Connect to real medical APIs

3. **Production Deployment**
   - Configure proper CORS origins
   - Add authentication to API endpoints
   - Set up proper database for symptoms
   - Add logging and monitoring

## Troubleshooting

### Common Issues:
1. **Backend not starting**: Check Java version and Maven installation
2. **CORS errors**: Verify backend is running on port 8080
3. **Frontend errors**: Check Node.js version and npm dependencies
4. **API not responding**: Backend falls back to local dataset automatically

### Support:
- Check browser console for errors
- Verify network requests in developer tools
- Test API endpoints directly with tools like Postman

The symptom checker is now fully integrated and ready to use! 🎉