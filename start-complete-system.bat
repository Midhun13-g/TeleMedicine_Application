@echo off
echo Starting TeleMedicine Application Complete System...
echo.

echo Installing Call Server Dependencies...
call npm install
echo.

echo Starting Call Server (Port 5002)...
start "Call Server" cmd /k "node unified-call-server.js"
timeout /t 3

echo Starting Spring Boot Backend (Port 8080)...
cd projectbackend
start "Spring Backend" cmd /k "mvn spring-boot:run"
cd ..
timeout /t 5

echo Starting React Frontend (Port 5173)...
cd project
start "React Frontend" cmd /k "npm run dev"
cd ..
timeout /t 3

echo Starting Symptom Checker Backend (Port 8000)...
cd Symptom_checker\backend
start "Symptom Checker" cmd /k "python main.py"
cd ..\..

echo.
echo ========================================
echo TeleMedicine Application System Started
echo ========================================
echo Call Server:      http://localhost:5002
echo Spring Backend:   http://localhost:8080
echo React Frontend:   http://localhost:5173
echo Symptom Checker:  http://localhost:8000
echo ========================================
echo.
echo Press any key to exit...
pause