# 🏁 TrackMania Scoreboard - Windows Quick Start Script

Write-Host "🏁 TrackMania Scoreboard - Docker Quick Start" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first:" -ForegroundColor Red
    Write-Host "   https://docs.docker.com/desktop/install/windows-install/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is available
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose is available: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not available. Please install Docker Compose:" -ForegroundColor Red
    Write-Host "   https://docs.docker.com/compose/install/" -ForegroundColor Yellow
    exit 1
}

# Stop any existing containers
Write-Host "🛑 Stopping any existing containers..." -ForegroundColor Yellow
try {
    docker-compose down 2>$null
} catch {
    # Ignore errors if no containers are running
}

# Build and start the application
Write-Host "🏗️ Building and starting TrackMania Scoreboard..." -ForegroundColor Cyan
Write-Host "   This may take a few minutes on the first run..." -ForegroundColor Gray

try {
    docker-compose up --build -d
    
    Write-Host ""
    Write-Host "🎉 SUCCESS! TrackMania Scoreboard is now running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "🔧 Backend API: http://localhost:3001/api" -ForegroundColor Cyan
    Write-Host "🗄️ MongoDB: localhost:27017" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔐 Demo Login:" -ForegroundColor Yellow
    Write-Host "   Email: speed@trackmania.com" -ForegroundColor White
    Write-Host "   Password: password123" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Useful Commands:" -ForegroundColor Yellow
    Write-Host "   docker-compose logs -f          # View logs" -ForegroundColor Gray
    Write-Host "   docker-compose down             # Stop services" -ForegroundColor Gray
    Write-Host "   docker-compose ps               # Check status" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🏁 Ready to race! Opening http://localhost:3000 in your browser..." -ForegroundColor Green
    
    # Open browser automatically
    Start-Process "http://localhost:3000"
    
} catch {
    Write-Host ""
    Write-Host "❌ Failed to start the application. Check the logs above for errors." -ForegroundColor Red
    Write-Host "💡 Common solutions:" -ForegroundColor Yellow
    Write-Host "   1. Make sure ports 3000, 3001, and 27017 are not in use" -ForegroundColor Gray
    Write-Host "   2. Try: docker-compose down; docker system prune -f" -ForegroundColor Gray
    Write-Host "   3. Make sure Docker Desktop is running" -ForegroundColor Gray
    Write-Host "   4. Try restarting Docker Desktop" -ForegroundColor Gray
    exit 1
} 