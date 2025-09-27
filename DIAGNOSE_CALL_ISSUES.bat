@echo off
echo 🔍 Diagnosing Call System Issues
echo ================================

echo 1. Checking if Call Server is running...
curl -s "http://localhost:5002/api/calls/debug" > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Call Server (port 5002) is running
) else (
    echo ❌ Call Server (port 5002) is NOT running
    echo   Solution: Run START_CALL_SERVER.bat
)

echo 2. Checking if Spring Boot Backend is running...
curl -s "http://localhost:8080/api/webrtc/join-room" -X POST -H "Content-Type: application/json" -d "{\"roomId\":\"test\",\"userId\":\"test\"}" > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Spring Boot Backend (port 8080) is running
) else (
    echo ❌ Spring Boot Backend (port 8080) is NOT running
    echo   Solution: Run 'mvn spring-boot:run' in projectbackend folder
)

echo 3. Checking if Frontend is running...
curl -s "http://localhost:3000" > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend (port 3000) is running
) else (
    echo ❌ Frontend (port 3000) is NOT running
    echo   Solution: Run 'npm run dev' in project folder
)

echo 4. Checking Node.js processes...
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find "node.exe" > nul
if %errorlevel% equ 0 (
    echo ✅ Node.js processes are running
) else (
    echo ❌ No Node.js processes found
)

echo 5. Checking Java processes...
tasklist /FI "IMAGENAME eq java.exe" 2>nul | find "java.exe" > nul
if %errorlevel% equ 0 (
    echo ✅ Java processes are running
) else (
    echo ❌ No Java processes found
)

echo.
echo ================================
echo 🎯 Quick Fix Commands:
echo.
echo If Call Server is not running:
echo   START_CALL_SERVER.bat
echo.
echo If Backend is not running:
echo   cd projectbackend
echo   mvn spring-boot:run
echo.
echo If Frontend is not running:
echo   cd project
echo   npm run dev
echo.
echo To start everything at once:
echo   COMPLETE_CALL_SYSTEM_FIX.bat
echo ================================
pause