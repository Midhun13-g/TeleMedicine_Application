@echo off
echo.
echo ========================================
echo   TeleAsha Admin Dashboard Setup
echo ========================================
echo.

echo [1/4] Starting Backend Server...
echo.
cd projectbackend
start "TeleAsha Backend" cmd /k "mvn spring-boot:run"
echo Backend starting in new window...
echo.

echo [2/4] Waiting for backend to initialize...
timeout /t 10 /nobreak > nul
echo.

echo [3/4] Starting Frontend...
echo.
cd ..\project
start "TeleAsha Frontend" cmd /k "npm run dev"
echo Frontend starting in new window...
echo.

echo [4/4] Opening Admin Test Page...
timeout /t 5 /nobreak > nul
start "" "test-admin.html"
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Default Admin Credentials:
echo   Email: admin@teleasha.com
echo   Password: admin123
echo.
echo Admin Secret Key: TELEASHA_ADMIN_2024
echo.
echo Services:
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:5173
echo   Test Page: test-admin.html
echo.
echo Press any key to exit...
pause > nul