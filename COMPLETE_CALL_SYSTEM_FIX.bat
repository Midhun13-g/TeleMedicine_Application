@echo off
echo 🔧 Complete Call System Fix
echo ===========================

echo 1. Installing required dependencies...
cd project
npm install socket.io-client
if %errorlevel% neq 0 (
    echo ❌ Failed to install socket.io-client
    pause
    exit /b 1
)

echo 2. Stopping any running servers...
taskkill /f /im java.exe 2>nul
taskkill /f /im node.exe 2>nul

echo 3. Starting Call Server (Socket.io)...
cd ..
start "Call Server" cmd /k "node unified-call-server.js"

echo 4. Waiting for call server...
timeout /t 5 > nul

echo 5. Starting Spring Boot Backend...
cd projectbackend
start "Backend" cmd /k "mvn spring-boot:run"

echo 6. Waiting for backend...
timeout /t 20 > nul

echo 7. Testing call system...
curl -s "http://localhost:5002/api/calls/doctors/available"
echo.
curl -s "http://localhost:8080/api/webrtc/join-room" -X POST -H "Content-Type: application/json" -d "{\"roomId\":\"test\",\"userId\":\"test\"}"

echo.
echo ================================
echo ✅ Call System Setup Complete!
echo.
echo 🔗 Services Running:
echo - Call Server (Socket.io): http://localhost:5002
echo - Spring Boot Backend: http://localhost:8080
echo - WebSocket Signaling: ws://localhost:8080/ws/signaling
echo.
echo 🎯 How to Test:
echo 1. Login as doctor in one browser
echo 2. Click "Go Online" in doctor dashboard
echo 3. Login as patient in another browser
echo 4. Click "Video Call" or "Audio Call" on available doctor
echo 5. Doctor should receive consultation request
echo 6. Doctor clicks "Accept & Start Call"
echo 7. Both should move to call screen
echo ================================
pause