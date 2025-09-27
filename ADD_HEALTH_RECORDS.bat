@echo off
echo 🏥 Adding Digital Health Records
echo ===============================

echo 1. Stopping backend...
taskkill /f /im java.exe 2>nul

echo 2. Rebuilding with health records...
cd projectbackend
call mvn clean compile -q

echo 3. Starting backend...
start "Backend" cmd /k "mvn spring-boot:run"

echo 4. Waiting for startup...
timeout /t 15 > nul

echo 5. Testing health records API...
curl -s "http://localhost:8080/api/health-records/patient/1"

echo.
echo ================================
echo ✅ Digital Health Records Added!
echo.
echo 📋 Features:
echo - Patient health records in overview
echo - Vital signs tracking
echo - Lab results display
echo - Status indicators (normal/high/low)
echo - Doctor attribution
echo.
echo 🎯 To view:
echo 1. Login as patient
echo 2. Go to overview tab
echo 3. See "Digital Health Records" section
echo ================================
pause