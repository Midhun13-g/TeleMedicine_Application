@echo off
echo ========================================
echo    TeleMedicine Call System Test
echo ========================================
echo.

echo 🚀 Starting all services...
echo.

echo 1. Starting Call Server...
start "Call Server" cmd /k "cd /d %~dp0 && node unified-call-server.js"
timeout /t 2 /nobreak > nul

echo 2. Starting Backend...
start "Backend" cmd /k "cd /d %~dp0projectbackend && mvn spring-boot:run"
timeout /t 5 /nobreak > nul

echo 3. Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0project && npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo ✅ All services started!
echo.
echo 📋 Manual Test Steps:
echo   1. Open TWO browser windows: http://localhost:5173
echo   2. Window 1: Login as doctor (dr.sharma@teleasha.com / password123)
echo   3. Window 2: Login as patient (patient1@teleasha.com / password123)
echo   4. Doctor: Click "Go Online" button
echo   5. Patient: Click "Video Call" for the online doctor
echo   6. Doctor: Click "Accept & Start Call"
echo   7. ✅ BOTH windows should show video call screen
echo.
echo 🔍 Check browser console for logs:
echo   - Doctor: "Doctor moved to call screen with room: room_xxx"
echo   - Patient: "Patient moved to call screen with room: room_xxx"
echo.
echo 📞 Expected Result:
echo   - Both users see video call interface
echo   - Local video shows your camera
echo   - Remote video shows placeholder
echo   - Call controls work (mute, video toggle, end call)
echo.
pause