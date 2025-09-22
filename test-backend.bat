@echo off
echo Testing Backend Connection...
echo.

echo 1. Testing Health Endpoint:
curl -X GET "http://localhost:8080/api/test/health" -H "Content-Type: application/json"
echo.
echo.

echo 2. Testing Doctors Endpoint:
curl -X GET "http://localhost:8080/api/test/doctors" -H "Content-Type: application/json"
echo.
echo.

echo 3. Testing Appointment Doctors Endpoint:
curl -X GET "http://localhost:8080/api/appointments/doctors" -H "Content-Type: application/json"
echo.
echo.

pause