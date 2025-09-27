@echo off
echo 🧪 Testing Pharmacy Information Display
echo =====================================

echo.
echo 1. Testing Medicine Search API...
curl -s "http://localhost:8080/api/medicines/search?q=Paracetamol" | jq .

echo.
echo 2. Testing Pharmacy Availability API...
curl -s "http://localhost:8080/api/pharmacies/medicine-availability/Paracetamol" | jq .

echo.
echo 3. Testing All Pharmacies API...
curl -s "http://localhost:8080/api/pharmacies" | jq .

echo.
echo 4. Opening test page...
start "" "test-medicine-search.html"

echo.
echo =====================================
echo ✅ Test completed! Check the results above.
echo 📋 The test page should show pharmacy names, addresses, and phone numbers.
echo.
pause