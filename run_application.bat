@echo off
echo Starting Medical AI Assistant for Visually Impaired Users...
echo.

echo Setting up the frontend...
cd frontend_app
if exist node_modules (
    echo Node modules already installed
) else (
    echo Installing frontend dependencies...
    npm install
)

echo.
echo Starting frontend server...
start cmd /k "npm run dev"

cd ..

echo.
echo Setting up the backend...
cd backend_api
if exist node_modules (
    echo Node modules already installed
) else (
    echo Installing backend dependencies...
    npm install
)

echo.
echo Starting backend server...
start cmd /k "npm run dev"

cd ..

echo.
echo Medical AI Assistant is now running!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo The voice-controlled system for visually impaired users is ready.
echo Say "Enable voice control" to start using voice commands.
pause