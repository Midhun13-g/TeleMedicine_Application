@echo off
echo Starting TeleMedicine Application...
echo.

echo Starting Backend Server...
cd /d "e:\SIH 25\TeleMedicine_Application\projectbackend"
start "Backend Server" cmd /k "mvn spring-boot:run"

echo Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo Starting Frontend...
cd /d "e:\SIH 25\TeleMedicine_Application\project"
start "Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
pause