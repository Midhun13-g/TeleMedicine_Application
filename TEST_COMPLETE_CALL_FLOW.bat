@echo off
echo 🧪 Testing Complete Call Flow
echo =============================

echo 1. Testing Call Server (Socket.io)...
curl -s "http://localhost:5002/api/calls/debug" > call_server_test.json
if %errorlevel% equ 0 (
    echo ✅ Call Server is running on port 5002
) else (
    echo ❌ Call Server not responding on port 5002
    echo Please run: START_CALL_SERVER.bat
    pause
    exit /b 1
)

echo 2. Testing Spring Boot Backend...
curl -s "http://localhost:8080/api/webrtc/join-room" -X POST -H "Content-Type: application/json" -d "{\"roomId\":\"test\",\"userId\":\"test\"}" > backend_test.json
if %errorlevel% equ 0 (
    echo ✅ Spring Boot Backend is running on port 8080
) else (
    echo ❌ Spring Boot Backend not responding on port 8080
    echo Please run: mvn spring-boot:run in projectbackend folder
    pause
    exit /b 1
)

echo 3. Testing doctor online status...
curl -s "http://localhost:5002/api/calls/doctor/online" -X POST -H "Content-Type: application/json" -d "{\"doctorId\":\"test_doctor\",\"doctorInfo\":{\"name\":\"Test Doctor\",\"specialization\":\"General\"}}"
echo ✅ Doctor status test sent

echo 4. Testing available doctors...
curl -s "http://localhost:5002/api/calls/doctors/available"
echo.

echo 5. Opening test browsers...
start "" "http://localhost:3000" 
timeout /t 2 > nul
start "" "http://localhost:3000"

echo.
echo ================================
echo 🎯 Manual Test Steps:
echo.
echo Browser 1 (Doctor):
echo 1. Login as doctor (doctor1@test.com / password)
echo 2. Click "Go Online" button
echo 3. Wait for "Available for Consultations" status
echo.
echo Browser 2 (Patient):
echo 1. Login as patient (patient1@test.com / password)
echo 2. Look for "Available Doctors" section
echo 3. Click "Video Call" on any online doctor
echo 4. Doctor should receive consultation request
echo 5. Doctor clicks "Accept & Start Call"
echo 6. Both should move to video call screen
echo.
echo 🔍 Troubleshooting:
echo - If no doctors show: Check call server console
echo - If call doesn't connect: Check browser console
echo - If "Status: Connecting...": Check WebRTC permissions
echo ================================

del call_server_test.json 2>nul
del backend_test.json 2>nul
pause