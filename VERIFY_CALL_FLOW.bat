@echo off
echo ========================================
echo    Call Flow Verification
echo ========================================
echo.

echo 🔍 Checking if call server is running...
curl -s http://localhost:5002 >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Call server is running on port 5002
) else (
    echo ❌ Call server is NOT running
    echo 🚀 Starting call server...
    start "Call Server" cmd /k "node unified-call-server.js"
    timeout /t 3 /nobreak > nul
)

echo.
echo 🧪 Testing call flow...
node test-call-flow.js

echo.
echo 📋 Call Flow Steps:
echo   1. Patient requests consultation
echo   2. Doctor receives request notification  
echo   3. Doctor clicks "Accept & Start Call"
echo   4. Both doctor and patient navigate to call screen
echo.
echo 🔧 If not working, check:
echo   - Call server is running (port 5002)
echo   - Browser console for socket connection errors
echo   - Both users are logged in and connected
echo.
pause