# 🏁 TrackMania Scoreboard - Local Development Startup Script

Write-Host "🏁 TrackMania Scoreboard - Local Development" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the trackmania-scoreboard directory" -ForegroundColor Red
    Write-Host "💡 Try: cd trackmania-scoreboard" -ForegroundColor Yellow
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first:" -ForegroundColor Red
    Write-Host "   https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Install frontend dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
}

# Install backend dependencies if needed
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
    cd backend
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
        exit 1
    }
    cd ..
}

# Build backend
Write-Host "🔨 Building backend..." -ForegroundColor Cyan
cd backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build backend" -ForegroundColor Red
    exit 1
}
cd ..

Write-Host ""
Write-Host "🚀 Starting TrackMania Scoreboard..." -ForegroundColor Green
Write-Host ""

# Start both servers
Write-Host "📱 Starting Frontend (Vite)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Normal

Write-Host "⚙️ Starting Backend (Express)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD/backend'; npm start" -WindowStyle Normal

# Wait a moment for servers to start
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🎉 TrackMania Scoreboard is starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:3001/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 Demo Login:" -ForegroundColor Yellow
Write-Host "   Email: speed@trackmania.com" -ForegroundColor White
Write-Host "   Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "💡 Two PowerShell windows opened:" -ForegroundColor Gray
Write-Host "   - One for the frontend server (Vite)" -ForegroundColor Gray
Write-Host "   - One for the backend server (Express)" -ForegroundColor Gray
Write-Host ""
Write-Host "🏁 Opening http://localhost:5173 in your browser..." -ForegroundColor Green

# Wait for servers to fully start
Start-Sleep -Seconds 5

# Open browser
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "✨ Ready to race! Enjoy your TrackMania Scoreboard!" -ForegroundColor Green 