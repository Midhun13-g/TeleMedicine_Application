@echo off
echo ========================================
echo Testing TeleMedicine Application System
echo ========================================
echo.

echo Testing Frontend Build...
cd project
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
) else (
    echo ✅ Frontend build successful
)
echo.

echo Testing Backend Compilation...
cd ..\projectbackend
call mvn compile -q
if %errorlevel% neq 0 (
    echo ❌ Backend compilation failed
    pause
    exit /b 1
) else (
    echo ✅ Backend compilation successful
)
echo.

echo Testing Call Server...
cd ..
node -c unified-call-server.js
if %errorlevel% neq 0 (
    echo ❌ Call server has syntax errors
    pause
    exit /b 1
) else (
    echo ✅ Call server syntax is valid
)
echo.

echo ========================================
echo All Tests Passed! ✅
echo ========================================
echo.
echo The system is ready to run. Execute COMPLETE_FIX.bat to start all services.
echo.
pause