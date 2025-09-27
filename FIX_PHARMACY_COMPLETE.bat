@echo off
echo 🔧 Complete Pharmacy System Fix
echo ================================

echo 1. Stopping any running backend...
taskkill /f /im java.exe 2>nul

echo 2. Cleaning and rebuilding backend...
cd projectbackend
call mvn clean compile -q
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo 3. Starting backend with fresh database...
start "Backend" cmd /k "mvn spring-boot:run"

echo 4. Waiting for backend to initialize...
timeout /t 15 > nul

echo 5. Testing pharmacy system...
curl -s "http://localhost:8080/api/pharmacies" | findstr "Apollo" > nul
if %errorlevel% equ 0 (
    echo ✅ Pharmacies created successfully
) else (
    echo ❌ Pharmacy creation failed
)

echo 6. Opening test pages...
cd ..
start "" "test-pharmacy-fix.html"
start "" "test-pharmacy-add.html"

echo.
echo ================================
echo 🎯 Test Instructions:
echo 1. Open test-pharmacy-fix.html
echo 2. Click "1. Test Pharmacy Users" - should show pharmacy users with IDs 7,8,9
echo 3. Click "2. Test Pharmacy Entities" - should show pharmacy entities with same IDs
echo 4. Click "3. Test Add Medicine" - should successfully add medicine
echo.
echo 🔑 Login Credentials:
echo - pharmacy1@test.com / password (ID: 7)
echo - pharmacy2@test.com / password (ID: 8) 
echo - pharmacy3@test.com / password (ID: 9)
echo ================================

pause