@echo off
title SkyIntel AI - Automatic Launcher
color 0A

:: Navigate to launcher directory
cd /d "%~dp0"

:: Clean old temp chrome profile to bypass cache completely
rd /s /q "%TEMP%\chrome_temp_profile" >nul 2>nul

echo Checking system dependencies...
where npm >nul 2>nul
if %errorlevel% equ 0 (
    echo [INFO] Node.js/npm detected. Booting in Full Development Mode...
    echo [1/3] Starting Backend on Port 8000...
    start "SkyIntel Backend" cmd /k ".venv\Scripts\uvicorn.exe main:app --app-dir backend --reload --host 127.0.0.1 --port 8000"
    
    echo [2/3] Starting Frontend Vite on Port 5173...
    start "SkyIntel Frontend" cmd /k "cd frontend && npm run dev"
    
    echo [3/3] Services Deployed Successfully!
    echo Waiting 8 seconds for server initialization...
    ping 127.0.0.1 -n 9 >nul
    start "" chrome "http://localhost:5173" --user-data-dir="%TEMP%\chrome_temp_profile" --no-first-run --no-default-browser-check
) else (
    echo [WARNING] Node.js/npm not found. Falling back to pre-built Production Mode...
    echo [1/2] Starting FastAPI Backend serving pre-compiled frontend static assets on Port 8000...
    start "SkyIntel Backend" cmd /k ".venv\Scripts\uvicorn.exe main:app --app-dir backend --host 127.0.0.1 --port 8000"
    
    echo [2/2] Services Deployed Successfully!
    echo Waiting 8 seconds for server initialization...
    ping 127.0.0.1 -n 9 >nul
    start "" chrome "http://localhost:8000" --user-data-dir="%TEMP%\chrome_temp_profile" --no-first-run --no-default-browser-check
)
pause
