@echo off
echo ========================================
echo QUICK CALL FLOW TEST
echo ========================================
echo.

echo Starting Call Server...
start "Call Server" cmd /k "cd /d d:\SIH'25\TeleMedicine_Application && node unified-call-server.js"
timeout /t 2

echo.
echo ========================================
echo TEST STEPS:
echo ========================================
echo 1. Open TWO browser windows at http://localhost:5173
echo 2. Window 1: Login as DOCTOR (doctor@test.com / password)
echo 3. Window 2: Login as PATIENT (patient@test.com / password)
echo 4. Doctor: Click "Go Online" button
echo 5. Patient: Should see doctor in Available Doctors list
echo 6. Patient: Click "Video Call" button
echo 7. Doctor: Should see consultation request - click "Accept & Start Call"
echo 8. RESULT: Both should move to call screen automatically
echo ========================================

pause