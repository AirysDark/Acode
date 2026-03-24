@echo off
title Acode Auto Setup

echo ===============================
echo Acode Auto Setup Script
echo ===============================

:: -------------------------------
:: STEP 1 - Check Node.js
:: -------------------------------
echo Checking Node.js...

where node >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found in PATH!
    echo Please install Node.js LTS from https://nodejs.org
    pause
    exit /b
)

node -v
npm -v

:: -------------------------------
:: STEP 2 - Fix PATH if needed
:: -------------------------------
echo Checking PATH...

echo %PATH% | find /I "nodejs" >nul
IF %ERRORLEVEL% NEQ 0 (
    echo Adding Node.js to PATH...
    setx PATH "%PATH%;C:\Program Files\nodejs\"
    echo Restart terminal after this script finishes.
)

:: -------------------------------
:: STEP 3 - Install dependencies
:: -------------------------------
echo Installing npm dependencies...
call npm install

IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed
    pause
    exit /b
)

:: -------------------------------
:: STEP 4 - Install Cordova
:: -------------------------------
echo Installing Cordova...
call npm install -g cordova

:: -------------------------------
:: STEP 5 - Run project setup
:: -------------------------------
echo Running project setup...
call npm run setup

IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm run setup failed
    pause
    exit /b
)

:: -------------------------------
:: STEP 6 - Build frontend (www)
:: -------------------------------
echo Building project...
call npm run build

IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed
    pause
    exit /b
)

:: -------------------------------
:: STEP 7 - Done
:: -------------------------------
echo ===============================
echo Setup Complete!
echo ===============================

echo.
echo Your frontend should now be in:
echo www\
echo.

pause