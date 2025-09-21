@echo off
echo Starting Call Server...
start "Call Server" cmd /k "cd /d d:\SIH'25\TeleMedicine_Application && node unified-call-server.js"

echo.
echo TEST INSTRUCTIONS:
echo 1. Open http://localhost:5173 in TWO browser windows
echo 2. Window 1: Login as DOCTOR (doctor@test.com / password)  
echo 3. Window 2: Login as PATIENT (patient@test.com / password)
echo 4. Doctor: Click "Go Online"
echo 5. Patient: Click "Video Call" for the doctor
echo 6. Doctor: Click "Accept & Start Call"
echo 7. BOTH should move to call screen
echo.
echo If patient doesn't move, click "Test Call Screen" button
echo.
pause