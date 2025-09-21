@echo off
echo ========================================
echo    TeleMedicine Complete System Startup
echo ========================================
echo.

echo 🚀 Starting TeleMedicine Application...
echo.

echo 📋 System Components:
echo   - Backend Server (Spring Boot) - Port 8080
echo   - Frontend (React + Vite) - Port 5173  
echo   - Call Server (Node.js) - Port 5002
echo.

echo 🔧 Starting Backend Server...
cd /d "%~dp0projectbackend"
start "Backend Server" cmd /k "mvn spring-boot:run"

echo ⏳ Waiting for backend to initialize...
timeout /t 10 /nobreak > nul

echo 🎯 Starting Call Server...
cd /d "%~dp0"
start "Call Server" cmd /k "node unified-call-server.js"

echo ⏳ Waiting for call server to initialize...
timeout /t 5 /nobreak > nul

echo 🌐 Starting Frontend...
cd /d "%~dp0project"
start "Frontend" cmd /k "npm run dev"

echo.
echo ✅ All services are starting up!
echo.
echo 📱 Access the application at:
echo   Frontend: http://localhost:5173
echo   Backend API: http://localhost:8080
echo   Call Server: http://localhost:5002
echo.
echo 👥 Demo Login Credentials:
echo   Patient: patient1@teleasha.com / password123
echo   Doctor: dr.sharma@teleasha.com / password123  
echo   Admin: admin@teleasha.com / admin123
echo.
echo 🧪 To test the system, run: node test-login-signup.js
echo.
echo Press any key to close this window...
pause > nul