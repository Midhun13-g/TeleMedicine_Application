@echo off
echo Starting TeleMedicine Application...
echo.

echo 1. Starting Backend...
cd projectbackend
start "Backend" cmd /k "mvnw spring-boot:run"

echo 2. Waiting 10 seconds for backend to start...
timeout /t 10 /nobreak

echo 3. Starting Frontend...
cd ..\project
start "Frontend" cmd /k "npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause