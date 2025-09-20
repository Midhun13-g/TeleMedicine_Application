@echo off
echo Installing Video Call Dependencies...

cd projectbackend
echo Installing backend dependencies...
mvn clean install
cd ..

cd project
echo Installing frontend dependencies...
npm install
cd ..

echo.
echo Video Call Setup Complete!
echo.
echo To start the application:
echo 1. Backend: cd projectbackend && mvn spring-boot:run
echo 2. Frontend: cd project && npm run dev
echo.
echo Features added:
echo - WebRTC video/audio calls
echo - Real-time notifications
echo - Call accept/reject functionality
echo - WebSocket signaling server
echo.
pause