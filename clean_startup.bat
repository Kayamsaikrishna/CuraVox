@echo off
echo ========================================
echo Medical AI Assistant - CLEAN STARTUP
echo ========================================

echo Killing existing processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im ollama.exe >nul 2>&1

timeout /t 3

echo Starting MongoDB (if installed)...
net start MongoDB >nul 2>&1

timeout /t 2

echo Starting Backend API...
start "Backend" cmd /k "cd /d D:\CMRU-MAJOR-PROJECT\backend_api && npm run dev"

timeout /t 8

echo Starting Frontend...
start "Frontend" cmd /k "cd /d D:\CMRU-MAJOR-PROJECT\frontend_app && npm run dev"

timeout /t 8

echo Starting AI/ML Engine...
start "AI Engine" cmd /k "cd /d D:\CMRU-MAJOR-PROJECT\ai_ml_engine && python medical_ai_core.py"

timeout /t 3

echo Starting Ollama...
start "Ollama" cmd /k "ollama serve"

echo.
echo ========================================
echo Services Started Successfully!
echo ========================================
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000  
echo API Health: http://localhost:5000/api/health
echo Ollama: http://localhost:11434
echo ========================================
echo.
echo Press any key to test connections...
pause >nul

echo Testing Backend API...
curl -s http://localhost:5000/api/health | findstr "status"

echo Testing Frontend...
curl -s http://localhost:3000 | findstr "html"

echo.
echo All services should now be running properly!
echo Press any key to exit...
pause >nul