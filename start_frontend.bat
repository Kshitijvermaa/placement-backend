@echo off
echo ========================================
echo  Starting Frontend Server
echo ========================================
echo.

cd client

echo Checking if node_modules exists...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

echo.
echo Starting frontend on port 5173...
echo Press Ctrl+C to stop
echo.
call npm run dev
