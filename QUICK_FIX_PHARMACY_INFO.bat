@echo off
echo 🔧 Quick Fix for Pharmacy Information
echo ===================================

echo 1. Stopping backend...
taskkill /f /im java.exe 2>nul

echo 2. Rebuilding...
cd projectbackend
call mvn clean compile -q

echo 3. Starting backend...
start "Backend" cmd /k "mvn spring-boot:run"

echo 4. Waiting for startup...
timeout /t 15 > nul

echo 5. Testing medicine search...
curl -s "http://localhost:8080/api/medicines/search?q=Cetirizine" | findstr "pharmacyName\|pharmacyAddress\|pharmacyContact"

echo.
echo ✅ Backend restarted with pharmacy info fix!
echo 🔍 Now search for medicines - pharmacy info should display correctly.
pause