@echo off
echo Starting Medical AI Assistant Frontend...
cd /d "D:\CMRU-MAJOR-PROJECT\frontend_app"
echo Current directory: %CD%
dir package.json
if exist package.json (
    echo Installing dependencies...
    npm install
    echo Starting development server...
    npm run dev
) else (
    echo package.json not found!
    pause
)