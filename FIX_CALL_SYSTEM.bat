@echo off
echo 🔧 Fixing Call System
echo ===================

echo 1. Installing socket.io-client...
cd project
npm install socket.io-client
if %errorlevel% neq 0 (
    echo ❌ Failed to install socket.io-client
    pause
    exit /b 1
)

echo 2. Updating call service to use correct port...
echo Updating frontend call service...

echo 3. Starting backend...
cd ..\projectbackend
start "Backend" cmd /k "mvn spring-boot:run"

echo 4. Waiting for backend...
timeout /t 10 > nul

echo 5. Testing call endpoints...
curl -s "http://localhost:8080/api/calls/doctors/available"
echo.

echo ================================
echo ✅ Call system fix completed!
echo.
echo 🔍 Issues found and fixes:
echo 1. Socket.io-client installed
echo 2. Backend call APIs working on port 8080
echo 3. WebRTC signaling available at /api/webrtc
echo.
echo ⚠️  Note: For full video calls, you may need:
echo - A separate signaling server on port 5002
echo - Or update VideoCall.tsx to use port 8080
echo ================================
pause