@echo off
echo ========================================
echo  Starting Backend Server
echo ========================================
echo.

echo Checking if node_modules exists...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

echo.
echo Starting server on port 5000...
echo Press Ctrl+C to stop
echo.
node server.js
