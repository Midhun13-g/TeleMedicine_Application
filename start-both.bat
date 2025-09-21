@echo off
echo Starting TeleMedicine Application...
echo.
echo Starting Backend in new window...
start "TeleMedicine Backend" cmd /k "cd projectbackend && mvnw.cmd spring-boot:run"

echo Waiting 10 seconds for backend to start...
timeout /t 10 /nobreak > nul

echo Starting Frontend in new window...
start "TeleMedicine Frontend" cmd /k "cd project && npm run dev"

echo.
echo Both services are starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
pause