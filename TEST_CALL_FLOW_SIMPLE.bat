@echo off
echo ========================================
echo    Simple Call Flow Test
echo ========================================
echo.

echo 🚀 Starting call server...
start "Call Server" cmd /k "cd /d %~dp0 && node unified-call-server.js"

echo ⏳ Waiting for server to start...
timeout /t 3 /nobreak > nul

echo 🌐 Starting frontend...
start "Frontend" cmd /k "cd /d %~dp0project && npm run dev"

echo.
echo 📋 Manual Test Steps:
echo   1. Open http://localhost:5173 in TWO browser windows
echo   2. Window 1: Login as doctor (dr.sharma@teleasha.com / password123)
echo   3. Window 2: Login as patient (patient1@teleasha.com / password123)
echo   4. Doctor: Click "Go Online" button
echo   5. Patient: Click "Video Call" button for the online doctor
echo   6. Doctor: Click "Accept & Start Call" 
echo   7. BOTH windows should move to call screen automatically
echo.
echo 🔍 Check browser console for detailed logs
echo.
pause