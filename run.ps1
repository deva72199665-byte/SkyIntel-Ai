Set-Location $PSScriptRoot

# Verify virtual env exists
if (-not (Test-Path .venv\Scripts\Activate.ps1)) {
    Write-Error "[ERROR] Virtual environment (.venv) not found."
    exit
}

# Clean old temp chrome profile
$tempProfile = Join-Path $env:TEMP "chrome_temp_profile"
if (Test-Path $tempProfile) {
    Remove-Item -Path $tempProfile -Recurse -Force -ErrorAction SilentlyContinue
}

# Check if npm is available
$npmCheck = Get-Command npm -ErrorAction SilentlyContinue

if ($npmCheck) {
    Write-Host "[INFO] Node.js/npm detected. Booting in Full Development Mode..."
    Write-Host "[1/3] Starting Backend on Port 8000..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\.venv\Scripts\uvicorn.exe main:app --app-dir backend --reload --host 127.0.0.1 --port 8000"
    
    Write-Host "[2/3] Starting Frontend Vite on Port 5173..."
    Start-Process cmd -ArgumentList "/c", "cd frontend && npm run dev"
    
    Write-Host "[3/3] Services Deployed Successfully! Waiting 8 seconds..."
    Start-Sleep -Seconds 8
    Start-Process chrome -ArgumentList "http://localhost:5173", "--user-data-dir=`"$tempProfile`"", "--no-first-run", "--no-default-browser-check"
} else {
    Write-Host "[WARNING] Node.js/npm not found. Falling back to pre-built Production Mode..."
    Write-Host "[1/2] Starting FastAPI Backend serving pre-compiled frontend static assets on Port 8000..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\.venv\Scripts\uvicorn.exe main:app --app-dir backend --host 127.0.0.1 --port 8000"
    
    Write-Host "[2/2] Services Deployed Successfully! Waiting 8 seconds..."
    Start-Sleep -Seconds 8
    Start-Process chrome -ArgumentList "http://localhost:8000", "--user-data-dir=`"$tempProfile`"", "--no-first-run", "--no-default-browser-check"
}
