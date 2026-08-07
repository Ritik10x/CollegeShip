@echo off
setlocal
set DEBUG=
set FIREBASE_DEBUG_MODE=
:: Deploy script for Windows
:: NOTE: Gmail creds live in BackendCollageCampus\functions\.env (loaded automatically on functions deploy).
:: Never use Secret Manager for Gmail — it caused billing. Use delete-gmail-secrets.ps1 only if old secrets return.

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



:: Deploy to Firebase (hosting, functions, storage, and firestore rules)
call firebase deploy --only hosting:collageship,functions,storage,firestore:rules
if errorlevel 1 exit /b %errorlevel%

echo Deployment completed successfully.
