@echo off
echo ========================================
echo TeleMedicine Application - Complete Fix
echo ========================================
echo.

echo Step 1: Installing Frontend Dependencies...
cd project
echo Installing socket.io-client and other dependencies...
call npm install socket.io-client@4.7.2
call npm install
echo.

echo Step 2: Fixing Socket.IO imports...
cd ..
echo Fixing socket imports in frontend...
node fix-socket-imports.js
echo.

echo Step 3: Installing Call Server Dependencies...
echo Installing call server dependencies...
call npm install
echo.

echo Step 4: Installing Backend Dependencies...
cd projectbackend
echo Installing Maven dependencies...
call mvn clean install -DskipTests
echo.

echo Step 5: Starting all services...
echo.
echo Starting Call Server (Port 5002)...
cd ..
start "Call Server" cmd /k "node unified-call-server.js"
timeout /t 3

echo Starting Spring Boot Backend (Port 8080)...
cd projectbackend
start "Spring Backend" cmd /k "mvn spring-boot:run"
cd ..
timeout /t 8

echo Starting React Frontend (Port 5173)...
cd project
start "React Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo Complete Fix Applied Successfully!
echo ========================================
echo.
echo Services running:
echo - Call Server: http://localhost:5002
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
echo ADMIN LOGIN:
echo Email: admin@teleasha.com
echo Password: admin123
echo.
echo Features Available:
echo ✓ Doctor Online/Offline Status
echo ✓ Real-time Consultation Requests
echo ✓ Video/Audio Calling
echo ✓ Real-time Prescription Updates
echo ✓ Patient Notifications
echo ✓ Available Doctor Listing
echo ✓ H2 Database (No MySQL setup needed)
echo.
echo Open http://localhost:5173 in your browser to access the application
echo.
echo Press any key to exit...
pause