@echo off
echo Starting TeleMedicine Application...
echo.

echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd /d e:\Downloads\Documents\GitHub\TeleMedicine_Application\projectbackend && call mvnw.cmd spring-boot:run"

echo [2/2] Waiting 15 seconds then starting Frontend...
timeout /t 15 /nobreak > nul

start "Frontend Server" cmd /k "cd /d e:\Downloads\Documents\GitHub\TeleMedicine_Application\project && npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo 🔗 URLs:
echo    Backend:  http://localhost:8080
echo    Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul