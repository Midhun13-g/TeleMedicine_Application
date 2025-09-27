@echo off
echo 🔧 Fixing Pharmacy Information Display
echo =====================================

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
timeout /t 20 > nul

echo 5. Testing pharmacy information APIs...
echo.
echo Testing medicine search API:
curl -s "http://localhost:8080/api/medicines/search?q=Paracetamol" > temp_medicine_search.json
type temp_medicine_search.json
echo.

echo Testing pharmacy availability API:
curl -s "http://localhost:8080/api/pharmacies/medicine-availability/Paracetamol" > temp_availability.json
type temp_availability.json
echo.

echo 6. Opening test pages...
cd ..
start "" "test-medicine-search.html"

echo.
echo ================================
echo 🎯 Test Instructions:
echo 1. Check the test page that opened
echo 2. Search for "Paracetamol" 
echo 3. Verify pharmacy information shows:
echo    - Pharmacy Name (Apollo Pharmacy, MedPlus, etc.)
echo    - Address (123 Main Street, etc.)
echo    - Contact (+91-9876543216, etc.)
echo    - Rating (4.5 stars, etc.)
echo    - Hours (24 Hours, etc.)
echo.
echo 🔍 If pharmacy info still shows "Unknown Pharmacy":
echo - Check backend console for error messages
echo - Verify database initialization completed
echo - Check if pharmacy entities were created
echo ================================

del temp_medicine_search.json 2>nul
del temp_availability.json 2>nul
pause