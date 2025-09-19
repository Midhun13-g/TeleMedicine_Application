@echo off
echo Starting TeleMedicine Application with Symptom Checker...

echo.
echo Starting Spring Boot Backend...
start "Backend" cmd /k "cd /d projectbackend && mvnw spring-boot:run"

echo.
echo Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo.
echo Starting React Frontend...
start "Frontend" cmd /k "cd /d project && npm run dev"

echo.
echo Both services are starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul