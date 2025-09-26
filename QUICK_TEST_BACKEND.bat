@echo off
echo.
echo ========================================
echo   Quick Backend Test
echo ========================================
echo.

echo Starting Backend...
cd projectbackend
start "Backend Server" cmd /k "mvn spring-boot:run"

echo.
echo Waiting for backend to start...
timeout /t 20 /nobreak > nul

echo.
echo Opening test page...
start "" "..\test-simple.html"

echo.
echo ========================================
echo   Instructions:
echo ========================================
echo.
echo 1. Wait for backend to fully start
echo 2. Test page should open automatically
echo 3. Click "Test Health" to verify backend
echo 4. Try registering and logging in users
echo.
echo If backend fails to start, check:
echo - Java version (should be 17+)
echo - Port 8080 is not in use
echo - No firewall blocking
echo.
pause