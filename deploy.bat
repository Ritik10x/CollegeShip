@echo off
setlocal
set DEBUG=
set FIREBASE_DEBUG_MODE=
:: Deploy script for Windows

:: Build frontend
cd FrontendCollageCampus
if not exist node_modules (call npm install)
call npm run build
if errorlevel 1 exit /b %errorlevel%
cd ..

:: Install backend dependencies
cd BackendCollageCampus\functions
if not exist node_modules (call npm install)
if errorlevel 1 exit /b %errorlevel%
cd ..\..

:: Upload Gmail OAuth credentials from the ignored local .env file.
:: Secret values are passed through temporary files and are never echoed.
powershell -NoProfile -ExecutionPolicy Bypass -File BackendCollageCampus\scripts\sync-firebase-secrets.ps1
if errorlevel 1 exit /b %errorlevel%

:: Deploy to Firebase (hosting, functions, storage, and firestore rules)
call firebase deploy --only hosting:collageship,functions,storage,firestore:rules
if errorlevel 1 exit /b %errorlevel%

echo Deployment completed successfully.
