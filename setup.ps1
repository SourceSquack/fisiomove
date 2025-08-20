# setup.ps1 - PowerShell setup script for FisioMove (Windows only)

[CmdletBinding()]
param(
    [switch]$Help,
    [switch]$StartDev
)

$ErrorActionPreference = "Stop"

function Write-Info { param([string]$Message) Write-Host "[INFO]  $Message" -ForegroundColor Cyan }
function Write-Success { param([string]$Message) Write-Host "[ OK ]  $Message" -ForegroundColor Green }
function Write-Fail { param([string]$Message) Write-Host "[ERR ]  $Message" -ForegroundColor Red }
function Fail { param([string]$Message) Write-Fail $Message; exit 1 }

if ($Help) {
    Write-Host @"
Usage: .\setup.ps1 [-Help] [-StartDev]

This script will:
  - Verify required tools: Node.js (v18+), npm, Python 3, pip
  - Bootstrap backend .env from .env.example
  - Create a Python venv for backend and install dependencies
  - Install frontend dependencies via npm
  - Optionally start backend (uvicorn) and frontend (Angular) dev servers

Options:
  -Help       Show this help message and exit
  -StartDev   After setup completes, start backend and frontend in watch mode
"@ -ForegroundColor Yellow
    exit 0
}

# Detect OS (Windows only)
$OS = if ($IsWindows -or ($PSVersionTable.PSVersion.Major -le 5)) { "Windows" } else { "Other" }
if ($OS -ne "Windows") { Fail "This script is intended for Windows PowerShell only." }

Write-Info "Starting FisioMove setup..."

# Ensure we run from repo root (expecting backend/ and frontend/ folders)
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RepoRoot

if (-not (Test-Path "backend")) { Fail "backend/ directory not found at: $RepoRoot" }
if (-not (Test-Path "frontend")) { Write-Info "frontend/ directory not found - skipping frontend setup" }

# Check Node.js
Write-Info "Checking Node.js..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Fail "Node.js is not installed. Install Node.js v18+ and retry." }
try {
    $nodeVer = node --version
    $nodeMajor = [int]($nodeVer -replace '^v(\d+).*', '$1')
    if ($nodeMajor -lt 18) { Fail "Node.js v18+ required (found $nodeVer)." }
    Write-Success "Node.js $nodeVer"
} catch { Fail "Failed to detect Node.js version" }

# Check npm
Write-Info "Checking npm..."
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { Fail "npm is not installed." }
try { $npmVer = npm --version; Write-Success "npm $npmVer" } catch { Fail "Failed to detect npm version" }

# Check Python
Write-Info "Checking Python 3..."
$PythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pv = (& python --version 2>&1)
    if ($pv -match 'Python 3\.') { $PythonCmd = 'python' }
}
if (-not $PythonCmd -and (Get-Command py -ErrorAction SilentlyContinue)) {
    # Windows Python launcher
    try { $pv = (& py -3 --version 2>&1); if ($pv -match 'Python 3\.') { $PythonCmd = 'py -3' } } catch {}
}
if (-not $PythonCmd -and (Get-Command python3 -ErrorAction SilentlyContinue)) { $PythonCmd = 'python3' }
if (-not $PythonCmd) { Fail "Python 3 not found. Install Python 3 and retry." }
Write-Success "Using $PythonCmd"

# Check pip
Write-Info "Checking pip..."
try {
    & $PythonCmd -m pip --version | Out-Null
    Write-Success "pip available via $PythonCmd -m pip"
} catch {
    Write-Info "pip not available; attempting to bootstrap with ensurepip..."
    try { & $PythonCmd -m ensurepip -U; Write-Success "pip bootstrapped" } catch { Fail "pip is required and could not be installed automatically." }
}

# Backend setup
Write-Info "Setting up backend..."
$BackendDir = Join-Path $RepoRoot 'backend'
$BackendEnvExample = Join-Path $BackendDir '.env.example'
$BackendEnv = Join-Path $BackendDir '.env'
if ((Test-Path $BackendEnvExample) -and (-not (Test-Path $BackendEnv))) {
    Copy-Item $BackendEnvExample $BackendEnv
    Write-Success "backend/.env created from .env.example"
} elseif (Test-Path $BackendEnv) {
    Write-Info "backend/.env already exists - skipping"
} else {
    Write-Info "No backend .env.example found - skipping"
}

# Create venv
$VenvDir = Join-Path $BackendDir 'venv'
if (-not (Test-Path $VenvDir)) {
    Write-Info "Creating Python venv in backend/venv..."
    & $PythonCmd -m venv $VenvDir
    Write-Success "Virtual environment created"
} else {
    Write-Info "Virtual environment already exists"
}

# Install backend dependencies
$VenvPython = Join-Path $VenvDir 'Scripts/python.exe'
if (-not (Test-Path $VenvPython)) { Fail "venv Python not found at $VenvPython" }
$ReqFile = Join-Path $BackendDir 'requirements.txt'
if (Test-Path $ReqFile) {
    Write-Info "Installing backend dependencies (pip)..."
    & $VenvPython -m pip install --upgrade pip
    & $VenvPython -m pip install -r $ReqFile
    Write-Success "Backend dependencies installed"
} else {
    Write-Info "backend/requirements.txt not found - skipping Python deps"
}

# Frontend setup
if (Test-Path (Join-Path $RepoRoot 'frontend')) {
    Write-Info "Setting up frontend..."
    $FrontendDir = Join-Path $RepoRoot 'frontend'
    Push-Location $FrontendDir
    try {
        # Validate Angular CLI (ng). If missing, attempt global install matching Angular 20.
        if (-not (Get-Command ng -ErrorAction SilentlyContinue)) {
            Write-Info "Angular CLI not found. Installing @angular/cli@20 globally (may require elevation)..."
            try {
                npm install -g @angular/cli@20
                Write-Success "Installed Angular CLI globally"
            } catch {
                Write-Fail "Failed to install Angular CLI globally. Try running PowerShell as Administrator and re-run setup."
            }
        } else {
            $ngVer = (ng version 2>$null | Select-String -Pattern 'Angular CLI').ToString()
            if ($ngVer) { Write-Info "$ngVer" }
        }

        if (Test-Path 'package-lock.json') {
            Write-Info "Running npm ci (using lockfile)"
            npm ci
        } else {
            Write-Info "Running npm install"
            bun install
        }
        Write-Success "Frontend dependencies installed"
    } catch {
        Write-Fail "Failed to install frontend dependencies: $($_.Exception.Message)"
    } finally {
        Pop-Location
    }
}

# Start dev servers if requested
if ($StartDev) {
    Write-Info "Starting development servers..."
    # Backend (uvicorn) in a new window
    $BackendCmd = "& `"$VenvPython`" -m uvicorn app.main:app --reload --port 8000"
    Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "Set-Location -LiteralPath `"$BackendDir`"; $BackendCmd" -WorkingDirectory $BackendDir
    Write-Success "Backend dev server starting at http://127.0.0.1:8000"

    # Frontend (Angular) in a new window
    $FrontendDir = Join-Path $RepoRoot 'frontend'
    if (Test-Path $FrontendDir) {
        $FrontendCmd = "npm start"
        Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "Set-Location -LiteralPath `"$FrontendDir`"; $FrontendCmd" -WorkingDirectory $FrontendDir
        Write-Success "Frontend dev server starting (Angular)"
    }

    Write-Info "Use Ctrl+C in the respective windows to stop servers."
} else {
    Write-Success @"
Setup complete!

Next steps:
    - Backend: $VenvPython -m uvicorn app.main:app --reload --port 8000 (in backend/)
  - Frontend: cd frontend; npm start
"@
}
