@echo off
title TrackMania Scoreboard - Local Development

echo.
echo 🏁 TrackMania Scoreboard - Local Development
echo =============================================
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the trackmania-scoreboard directory
    echo 💡 Try: cd trackmania-scoreboard
    pause
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first:
    echo    https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed
echo.

:: Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
)

if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
    cd ..
)

:: Build backend
echo 🔨 Building backend...
cd backend
npm run build
if errorlevel 1 (
    echo ❌ Failed to build backend
    pause
    exit /b 1
)
cd ..

echo.
echo 🚀 Starting TrackMania Scoreboard...
echo.

:: Start frontend in new window
echo 📱 Starting Frontend (Vite)...
start "TrackMania Frontend" cmd /k "npm run dev"

:: Wait a moment
timeout /t 2 /nobreak >nul

:: Start backend in new window
echo ⚙️ Starting Backend (Express)...
start "TrackMania Backend" cmd /k "cd backend && npm start"

:: Wait for servers to start
timeout /t 5 /nobreak >nul

echo.
echo 🎉 TrackMania Scoreboard is starting!
echo.
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend API: http://localhost:3001/api
echo.
echo 🔐 Demo Login:
echo    Email: speed@trackmania.com
echo    Password: password123
echo.
echo 💡 Two command windows opened:
echo    - One for the frontend server (Vite)
echo    - One for the backend server (Express)
echo.
echo 🏁 Opening http://localhost:5173 in your browser...

:: Open browser
start http://localhost:5173

echo.
echo ✨ Ready to race! Enjoy your TrackMania Scoreboard!
echo.
pause 