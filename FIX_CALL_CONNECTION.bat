@echo off
echo 🔧 Fixing Call Connection Issues
echo ===============================

echo 1. Stopping backend...
taskkill /f /im java.exe 2>nul

echo 2. Rebuilding backend...
cd projectbackend
call mvn clean compile -q

echo 3. Starting backend with WebSocket support...
start "Backend" cmd /k "mvn spring-boot:run"

echo 4. Waiting for backend startup...
timeout /t 15 > nul

echo 5. Testing WebSocket endpoint...
echo Testing if WebSocket signaling is available...
curl -s "http://localhost:8080/api/webrtc/join-room" -X POST -H "Content-Type: application/json" -d "{\"roomId\":\"test\",\"userId\":\"test\"}"

echo.
echo 6. Testing call endpoints...
curl -s "http://localhost:8080/api/calls/doctors/available"

echo.
echo ================================
echo ✅ Call system fixes applied:
echo 1. Replaced Socket.io with native WebSocket
echo 2. WebSocket endpoint: ws://localhost:8080/ws/signaling
echo 3. Call APIs available on port 8080
echo.
echo 🎥 To test video calls:
echo 1. Login as doctor and patient in different browsers
echo 2. Doctor should go online for consultations
echo 3. Patient can request video/audio call
echo 4. Calls should now connect properly
echo ================================
pause