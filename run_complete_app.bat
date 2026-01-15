@echo off
echo ========================================
echo Medical AI Assistant - Complete Startup
echo ========================================

echo Checking prerequisites...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js/npm not found. Please install Node.js first.
    pause
    exit /b 1
)

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Please install Python 3.8+ first.
    pause
    exit /b 1
)

where ollama >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Ollama not found. AI features will be limited.
    echo Install Ollama from https://ollama.ai for full AI capabilities.
    timeout /t 5
)

echo ✓ Prerequisites OK

echo.
echo Starting Backend API...
start "Backend" cmd /k "cd /d D:\CMRU-MAJOR-PROJECT\backend_api && npm install && npm run dev"

timeout /t 5

echo Starting Frontend...
start "Frontend" cmd /k "cd /d D:\CMRU-MAJOR-PROJECT\frontend_app && npm install --legacy-peer-deps && npm install class-variance-authority tailwind-merge && npm run dev"

timeout /t 5

echo Starting AI/ML Engine...
start "AI Engine" cmd /k "cd /d D:\CMRU-MAJOR-PROJECT\ai_ml_engine && python test_components.py && echo. && echo AI/ML Engine running... && python medical_ai_core.py"

timeout /t 3

echo Starting Ollama (if available)...
start "Ollama" cmd /k "ollama serve"

echo.
echo ========================================
echo Services Started Successfully!
echo ========================================
echo Frontend: http://localhost:3004 (or higher port if in use)
echo Backend: http://localhost:5000  
echo Ollama: http://localhost:11434
echo ========================================
echo.
echo To test AI components:
echo cd ai_ml_engine
echo python test_components.py
echo.
echo Press any key to exit...
pause >nul