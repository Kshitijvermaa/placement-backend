@echo off
setlocal

echo ========================================
echo  Setting up Placement Portal Database
echo ========================================
echo.

SET "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 9.6\bin\mysql.exe"

if not exist "%MYSQL_EXE%" (
    echo ERROR: MySQL executable not found at:
    echo %MYSQL_EXE%
    echo.
    echo Update MYSQL_EXE path in setup_database.bat to match your MySQL install.
    pause
    exit /b 1
)

set /p MYSQL_PASSWORD=Enter MySQL root password (leave blank if none):

set "MYSQL_AUTH="
if not "%MYSQL_PASSWORD%"=="" set "MYSQL_AUTH=--password=%MYSQL_PASSWORD%"

echo Step 1: Dropping old database and creating fresh one...
"%MYSQL_EXE%" -u root %MYSQL_AUTH% < setup_fresh.sql
if %errorlevel% neq 0 (
    echo ERROR: Could not connect to MySQL or create database
    echo Hint: verify root password, MySQL server status, and MySQL executable path.
    pause
    exit /b 1
)

echo Step 2: Loading schema...
"%MYSQL_EXE%" -u root %MYSQL_AUTH% placement_db < schema.sql
if %errorlevel% neq 0 (
    echo ERROR: Could not load schema
    echo Hint: check schema.sql for SQL errors and ensure placement_db was created.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Database setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run: start_backend.bat
echo 2. Run: start_frontend.bat (in new window)
echo.
pause
