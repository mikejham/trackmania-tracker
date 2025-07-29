#!/bin/bash

# 🏁 TrackMania Scoreboard - Quick Start Script
echo "🏁 TrackMania Scoreboard - Docker Quick Start"
echo "=============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker is installed"

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Build and start the application
echo "🏗️  Building and starting TrackMania Scoreboard..."
echo "   This may take a few minutes on the first run..."

if docker-compose up --build -d; then
    echo ""
    echo "🎉 SUCCESS! TrackMania Scoreboard is now running!"
    echo ""
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:3001/api"
    echo "🗄️  MongoDB: localhost:27017"
    echo ""
    echo "🔐 Demo Login:"
    echo "   Email: speed@trackmania.com"
    echo "   Password: password123"
    echo ""
    echo "📋 Useful Commands:"
    echo "   docker-compose logs -f          # View logs"
    echo "   docker-compose down             # Stop services"
    echo "   docker-compose ps               # Check status"
    echo ""
    echo "🏁 Ready to race! Open http://localhost:3000 in your browser!"
else
    echo ""
    echo "❌ Failed to start the application. Check the logs above for errors."
    echo "💡 Common solutions:"
    echo "   1. Make sure ports 3000, 3001, and 27017 are not in use"
    echo "   2. Try: docker-compose down && docker system prune -f"
    echo "   3. Check Docker daemon is running"
    exit 1
fi 