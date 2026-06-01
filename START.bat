@echo off
title MediCare AI - Starting Project...
color 0A

echo.
echo  ============================================
echo     MediCare AI - Project Startup
echo  ============================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js is not installed!
    echo  Please install Node.js from: https://nodejs.org
    pause
    exit /b 1
)

echo  [OK] Node.js found
echo.

:: Check if MongoDB is running
echo  Checking MongoDB...
mongosh --eval "db.runCommand({ping:1})" --quiet >nul 2>nul
if %errorlevel% neq 0 (
    echo  [WARNING] MongoDB is not running.
    echo  The app will work but some features may be limited.
    echo  To install MongoDB: https://www.mongodb.com/try/download/community
    echo.
) else (
    echo  [OK] MongoDB is running
    echo.
)

:: Install dependencies if node_modules missing
if not exist "backend\node_modules" (
    echo  Installing backend dependencies...
    cd backend
    npm install
    cd ..
    echo  [OK] Backend dependencies installed
    echo.
)

if not exist "frontend\node_modules" (
    echo  Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
    echo  [OK] Frontend dependencies installed
    echo.
)

:: Kill any existing processes on ports 3000 and 5000
echo  Clearing ports 3000 and 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do taskkill /PID %%a /F >nul 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING 2^>nul') do taskkill /PID %%a /F >nul 2>nul
timeout /t 1 /nobreak >nul
echo  [OK] Ports cleared
echo.

:: Start Backend in new window
echo  Starting Backend Server (port 5000)...
start "MediCare AI - Backend" /min cmd /c "cd /d %~dp0backend && node server.js && pause"

:: Wait for backend to start
timeout /t 3 /nobreak >nul
echo  [OK] Backend started on http://localhost:5000
echo.

:: Start Frontend in new window
echo  Starting Frontend Dev Server (port 3000)...
start "MediCare AI - Frontend" /min cmd /c "cd /d %~dp0frontend && npx vite --host && pause"

:: Wait for frontend to start
timeout /t 4 /nobreak >nul
echo  [OK] Frontend started on http://localhost:3000
echo.

:: Open browser
echo  Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo  ============================================
echo     MediCare AI is RUNNING!
echo  ============================================
echo.
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:5000
echo.
echo   To STOP the project:
echo     Close the "MediCare AI - Backend" and
echo     "MediCare AI - Frontend" terminal windows
echo.
echo   Press any key to exit this launcher...
pause >nul
