@echo off
echo ========================================
echo    TeleMedicine System Status Check
echo ========================================
echo.

echo 🔍 Checking system components...
echo.

echo 1️⃣ Backend Server (Port 8080):
curl -s http://localhost:8080/api/admin/stats >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Backend is running
) else (
    echo ❌ Backend is not responding
)

echo.
echo 2️⃣ Call Server (Port 5002):
curl -s http://localhost:5002 >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Call Server is running
) else (
    echo ❌ Call Server is not responding
)

echo.
echo 3️⃣ Frontend (Port 5173):
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Frontend is running
) else (
    echo ❌ Frontend is not responding
)

echo.
echo 🧪 Running login/signup test...
node test-login-signup.js

echo.
echo 📋 System Status Summary:
echo   - If all components show ✅, the system is ready
echo   - If any show ❌, start them using START_COMPLETE_SYSTEM.bat
echo.
pause