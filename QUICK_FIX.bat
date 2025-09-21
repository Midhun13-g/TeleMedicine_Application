@echo off
echo ========================================
echo Quick Fix for Login and Call Issues
echo ========================================
echo.

echo Step 1: Testing Backend Connection...
node test-backend.js
echo.

echo Step 2: Restarting Backend with fixes...
cd projectbackend
echo Stopping any existing backend processes...
taskkill /f /im java.exe 2>nul
timeout /t 2

echo Starting backend with H2 database...
start "Spring Backend" cmd /k "mvn spring-boot:run"
echo Waiting for backend to start...
timeout /t 15

echo Step 3: Testing login after restart...
cd ..
node test-backend.js
echo.

echo Step 4: Starting frontend...
cd project
start "React Frontend" cmd /k "npm run dev"
echo.

echo ========================================
echo Quick Fix Complete!
echo ========================================
echo.
echo Test Login:
echo Doctor: dr.sharma@teleasha.com / password123
echo Patient: patient1@teleasha.com / password123
echo.
echo Fixed Issues:
echo ✓ CORS configuration for login/signup
echo ✓ Patient won't enter call mode when rejected
echo ✓ Better error logging for debugging
echo.
echo If login still fails:
echo 1. Check backend console for user creation logs
echo 2. Check browser console for detailed errors
echo 3. Try H2 console: http://localhost:8080/h2-console
echo.
pause