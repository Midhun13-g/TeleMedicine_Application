@echo off
echo.
echo ========================================
echo   Testing Login/Signup Functionality
echo ========================================
echo.

echo [1/3] Starting Backend Server...
cd projectbackend
start "Backend" cmd /k "mvn spring-boot:run"
echo Backend starting...
echo.

echo [2/3] Waiting for backend to initialize...
timeout /t 15 /nobreak > nul
echo.

echo [3/3] Opening Test Pages...
start "" "..\test-login-signup.html"
start "" "..\test-admin.html"
echo.

echo ========================================
echo   Test Instructions:
echo ========================================
echo.
echo 1. Backend should be running on http://localhost:8080
echo 2. Test pages opened in browser
echo 3. Try these tests:
echo    - Register new users (patient, doctor, admin)
echo    - Login with registered users
echo    - Test admin functionality
echo    - Test suspension features
echo.
echo Default Admin: admin@teleasha.com / admin123
echo Admin Key: TELEASHA_ADMIN_2024
echo.
echo Press any key to exit...
pause > nul