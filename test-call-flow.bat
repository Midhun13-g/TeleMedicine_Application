@echo off
echo ========================================
echo TESTING CALL FLOW - PATIENT TO DOCTOR
echo ========================================
echo.

echo 1. Starting Call Server...
start "Call Server" cmd /k "cd /d d:\SIH'25\TeleMedicine_Application && node unified-call-server.js"
timeout /t 3

echo 2. Starting Backend Server...
start "Backend Server" cmd /k "cd /d d:\SIH'25\TeleMedicine_Application\projectbackend && mvn spring-boot:run"
timeout /t 5

echo 3. Starting Frontend...
start "Frontend" cmd /k "cd /d d:\SIH'25\TeleMedicine_Application\project && npm run dev"
timeout /t 3

echo.
echo ========================================
echo MANUAL TEST STEPS:
echo ========================================
echo 1. Open http://localhost:5173 in TWO browser windows
echo 2. In Window 1: Login as DOCTOR (user: doctor@test.com, pass: password)
echo 3. In Window 2: Login as PATIENT (user: patient@test.com, pass: password)
echo 4. In Doctor window: Click "Go Online" button
echo 5. In Patient window: You should see the doctor in "Available Doctors"
echo 6. In Patient window: Click "Video Call" button for the doctor
echo 7. In Doctor window: You should see consultation request - click "Accept & Start Call"
echo 8. BOTH windows should automatically move to video call screen
echo.
echo Expected Result: Both doctor and patient should be on call screen
echo ========================================

pause