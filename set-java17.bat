@echo off
REM Set Java 17 for this project
REM Update this path to your Java 17 installation
SET JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot
SET PATH=%JAVA_HOME%\bin;%PATH%

echo Java Version:
java -version

echo Maven Wrapper Build:
cd "%~dp0projectbackend"
.\mvnw.cmd clean compile

pause