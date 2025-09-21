@echo off
echo Starting Backend Server...
cd /d "e:\Downloads\Documents\GitHub\TeleMedicine_Application\projectbackend"

echo Checking for Maven...
where mvn >nul 2>&1
if %errorlevel% neq 0 (
    echo Maven not found in PATH. Trying Maven wrapper...
    if exist "mvnw.cmd" (
        echo Using Maven wrapper...
        call mvnw.cmd spring-boot:run
    ) else (
        echo Maven wrapper not found. Please install Maven or use IDE to run the project.
        pause
        exit /b 1
    )
) else (
    echo Using system Maven...
    mvn spring-boot:run
)

pause