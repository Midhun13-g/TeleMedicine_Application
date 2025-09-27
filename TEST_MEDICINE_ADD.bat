@echo off
echo ========================================
echo    TESTING MEDICINE ADDITION FEATURE
echo ========================================
echo.

echo 1. Starting backend server...
cd /d "%~dp0projectbackend"
start "Backend Server" cmd /k "mvn spring-boot:run"

echo.
echo 2. Waiting for backend to start (30 seconds)...
timeout /t 30 /nobreak

echo.
echo 3. Opening test page...
start "" "%~dp0test-medicine-add-fixed.html"

echo.
echo 4. Testing API endpoints...
echo.

echo Testing connection...
curl -s -o nul -w "Backend Status: %%{http_code}\n" http://localhost:8080/api/medicines/popular

echo.
echo Testing pharmacy existence...
curl -s -o nul -w "Pharmacy Check: %%{http_code}\n" http://localhost:8080/api/pharmacies/1

echo.
echo Testing medicine addition...
curl -X POST http://localhost:8080/api/medicines/add ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Medicine\",\"stock\":50,\"price\":25.0,\"pharmacyId\":1}" ^
  -w "Add Medicine: %%{http_code}\n"

echo.
echo ========================================
echo Test completed! Check the browser for detailed results.
echo Backend is running in a separate window.
echo ========================================
pause