@echo off
echo ========================================
echo Medical AI Assistant - Health Check
echo ========================================

echo Checking Backend API...
curl -s http://localhost:5000/api/health > backend_status.txt 2>nul
if %errorlevel% equ 0 (
    echo ✅ Backend API: RUNNING
    type backend_status.txt
) else (
    echo ❌ Backend API: NOT RESPONDING
)

echo.
echo Checking Frontend...
curl -s http://localhost:3000 > frontend_status.txt 2>nul
if %errorlevel% equ 0 (
    echo ✅ Frontend: RUNNING
) else (
    echo ❌ Frontend: NOT RESPONDING
)

echo.
echo Checking MongoDB Connection...
cd /d D:\CMRU-MAJOR-PROJECT\backend_api
node -e "require('./config/db')().then(() => console.log('✅ MongoDB: CONNECTED')).catch(err => console.log('❌ MongoDB: CONNECTION FAILED'))" 2>nul

echo.
echo Checking AI/ML Engine...
cd /d D:\CMRU-MAJOR-PROJECT\ai_ml_engine
python test_components.py > ai_test_results.txt 2>nul
if %errorlevel% equ 0 (
    echo ✅ AI/ML Engine: WORKING
    findstr "All Tests Passed" ai_test_results.txt >nul
    if %errorlevel% equ 0 (
        echo   All components tested successfully
    )
) else (
    echo ❌ AI/ML Engine: ISSUES DETECTED
)

echo.
echo ========================================
echo Health Check Complete
echo ========================================

del backend_status.txt frontend_status.txt ai_test_results.txt 2>nul
pause