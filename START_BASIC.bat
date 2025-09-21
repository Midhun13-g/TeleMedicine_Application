@echo off
echo ========================================
echo Starting TeleMedicine Application (Basic)
echo ========================================
echo.

echo Step 1: Starting Spring Boot Backend...
cd projectbackend
start "Spring Backend" cmd /k "mvn spring-boot:run"
echo Backend starting on port 8080...
timeout /t 8

echo Step 2: Starting React Frontend...
cd ..\project
start "React Frontend" cmd /k "npm run dev"
echo Frontend starting on port 5173...
timeout /t 5

echo.
echo ========================================
echo Basic System Started!
echo ========================================
echo.
echo Services running:
echo - Spring Backend: http://localhost:8080  
echo - React Frontend: http://localhost:5173
echo - H2 Database Console: http://localhost:8080/h2-console
echo.
echo Default Login Credentials:
echo.
echo DOCTOR LOGIN:
echo Email: dr.sharma@teleasha.com
echo Password: password123
echo.
echo PATIENT LOGIN:  
echo Email: patient1@teleasha.com
echo Password: password123
echo.
echo Open http://localhost:5173 in your browser
echo.
echo Press any key to exit...
pause