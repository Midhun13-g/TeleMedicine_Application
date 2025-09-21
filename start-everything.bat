@echo off
echo ========================================
echo Starting TeleMedicine Application
echo ========================================

echo.
echo [1/3] Starting Backend Server...
start "Backend Server" cmd /k "cd /d e:\Downloads\Documents\GitHub\TeleMedicine_Application\projectbackend && (where mvn >nul 2>&1 && mvn spring-boot:run || (echo Maven not found, please install Maven && pause))"

echo.
echo [2/3] Waiting for backend to start...
timeout /t 15 /nobreak > nul

echo.
echo [3/3] Starting Frontend...
start "Frontend Server" cmd /k "cd /d e:\Downloads\Documents\GitHub\TeleMedicine_Application\project && npm run dev"

echo.
echo ========================================
echo Application Starting...
echo ========================================
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
echo Test API: file:///e:/Downloads/Documents/GitHub/TeleMedicine_Application/test-medicine-api.html
echo.
echo Press any key to exit...
pause > nul