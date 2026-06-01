@echo off
title MediCare AI - Stopping Project...
color 0C

echo.
echo  ============================================
echo     MediCare AI - Stopping All Servers
echo  ============================================
echo.

:: Kill processes on port 3000 (Frontend)
echo  Stopping Frontend (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    taskkill /PID %%a /F >nul 2>nul
    echo  [OK] Frontend process stopped
)

:: Kill processes on port 5000 (Backend)
echo  Stopping Backend (port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING 2^>nul') do (
    taskkill /PID %%a /F >nul 2>nul
    echo  [OK] Backend process stopped
)

echo.
echo  All servers stopped successfully!
echo.
pause
