@echo off
echo 🏥 Health Records for All Patients
echo ==================================

echo 1. Stopping backend...
taskkill /f /im java.exe 2>nul

echo 2. Starting backend with health records...
cd projectbackend
start "Backend" cmd /k "mvn spring-boot:run"

echo 3. Waiting for startup...
timeout /t 20 > nul

echo 4. Fetching health records for all patients...
echo.

echo === PATIENT 1 (Ramesh Kumar) ===
curl -s "http://localhost:8080/api/health-records/patient/1" | jq .
echo.

echo === PATIENT 2 (Sunita Devi) ===
curl -s "http://localhost:8080/api/health-records/patient/2" | jq .
echo.

echo === PATIENT 3 (Kiran Patel) ===
curl -s "http://localhost:8080/api/health-records/patient/3" | jq .
echo.

echo ✅ All health records displayed!
echo 📋 Access via frontend: Patient Dashboard → Overview → Health Records
pause