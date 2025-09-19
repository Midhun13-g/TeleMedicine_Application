@echo off
echo Installing and Starting MongoDB...

echo.
echo Option 1: Install MongoDB Community Server
echo Download from: https://www.mongodb.com/try/download/community
echo.

echo Option 2: Use Docker (if you have Docker installed)
echo docker run --name mongodb -p 27017:27017 -d mongo:latest
echo.

echo Option 3: Use MongoDB Atlas (Cloud - Free Tier)
echo 1. Go to https://www.mongodb.com/atlas
echo 2. Create free account
echo 3. Create cluster
echo 4. Get connection string
echo.

echo Option 4: Use Embedded MongoDB (for development)
echo Press any key to configure embedded MongoDB...
pause > nul

echo Configuring embedded MongoDB for development...
echo This will modify your application to use embedded MongoDB for testing.

pause