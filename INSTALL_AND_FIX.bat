@echo off
echo ========================================
echo TeleMedicine Application - Install & Fix
echo ========================================
echo.

echo Step 1: Installing Frontend Dependencies...
cd project
echo Installing socket.io-client...
call npm install socket.io-client@4.7.2
echo Installing missing dependencies...
call npm install
echo.

echo Step 2: Installing Call Server Dependencies...
cd ..
echo Installing call server dependencies...
call npm install
echo.

echo Step 3: Installing Backend Dependencies...
cd projectbackend
echo Installing Maven dependencies...
call mvn clean install -DskipTests
echo.

echo Step 4: Re-enabling Socket.IO imports...
cd ..
echo Fixing socket imports in frontend...
node fix-socket-imports.js

echo Step 5: Starting all services...
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

echo.
echo ========================================
echo Installation and Setup Complete!
echo ========================================
echo.
echo Services running:
echo - Call Server: http://localhost:5002
echo - Spring Backend: http://localhost:8080  
echo - React Frontend: http://localhost:5173
echo.
echo Features Available:
echo ✓ Doctor Online/Offline Status
echo ✓ Real-time Consultation Requests
echo ✓ Video/Audio Calling
echo ✓ Real-time Prescription Updates
echo ✓ Patient Notifications
echo ✓ Available Doctor Listing
echo.
echo Press any key to exit...
pause