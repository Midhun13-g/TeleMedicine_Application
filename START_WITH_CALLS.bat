@echo off
echo ========================================
echo TeleMedicine Application with Call Features
echo ========================================
echo.

echo Step 1: Starting Call Server (Required for real-time features)...
start "Call Server" cmd /k "node unified-call-server.js"
echo Waiting for call server to initialize...
timeout /t 5

echo Step 2: Starting Spring Boot Backend...
cd projectbackend
start "Spring Backend" cmd /k "mvn spring-boot:run"
echo Waiting for backend to initialize...
timeout /t 10

echo Step 3: Starting React Frontend...
cd ..\project
start "React Frontend" cmd /k "npm run dev"
echo.

echo ========================================
echo All Services Started!
echo ========================================
echo.
echo Services:
echo - Call Server: http://localhost:5002 (Real-time features)
echo - Spring Backend: http://localhost:8080 (API)
echo - React Frontend: http://localhost:5173 (UI)
echo.
echo Test Credentials:
echo.
echo DOCTOR:
echo Email: dr.sharma@teleasha.com
echo Password: password123
echo.
echo PATIENT:
echo Email: patient1@teleasha.com
echo Password: password123
echo.
echo Features Available:
echo ✓ Doctor Online/Offline Status
echo ✓ Real-time Doctor Visibility for Patients
echo ✓ Live Consultation Requests
echo ✓ Video/Audio Call Integration
echo ✓ Real-time Prescription Updates
echo.
echo Instructions:
echo 1. Login as Doctor → Click "Go Online"
echo 2. Login as Patient → See available doctors
echo 3. Patient can request Video/Audio calls
echo 4. Doctor receives real-time notifications
echo 5. Doctor can Accept/Reject requests
echo.
echo Press any key to exit...
pause