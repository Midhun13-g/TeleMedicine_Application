@echo off
echo 🔧 Quick Pharmacy System Fix
echo ================================

echo 1. Checking if backend is running...
curl -s http://localhost:8080/api/pharmacies > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend not running. Starting backend...
    cd projectbackend
    start "Backend" cmd /k "mvn spring-boot:run"
    cd ..
    echo ⏳ Waiting for backend to start...
    timeout /t 10 > nul
) else (
    echo ✅ Backend is running
)

echo.
echo 2. Testing pharmacy endpoints...
curl -s "http://localhost:8080/api/pharmacies" | findstr "name" > nul
if %errorlevel% equ 0 (
    echo ✅ Pharmacies found in database
) else (
    echo ❌ No pharmacies found - database might need initialization
)

echo.
echo 3. Opening test page...
start "" "test-pharmacy-add.html"

echo.
echo 4. Opening pharmacy dashboard...
cd project
start "Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ================================
echo 🎯 Quick Test Steps:
echo 1. Wait for frontend to load (usually http://localhost:5173)
echo 2. Login as pharmacy user (pharmacy1@test.com / password)
echo 3. Go to pharmacy dashboard
echo 4. Try adding a medicine
echo.
echo 🔍 If issues persist:
echo - Check test-pharmacy-add.html for detailed debugging
echo - Look at backend console for error messages
echo - Verify pharmacy ID exists in database
echo ================================

pause