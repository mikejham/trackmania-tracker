# 🏁 TrackMania Scoreboard

A modern, professional scoreboard application for TrackMania racing times with global leaderboards, weekly challenges, and real-time rankings.

## ✨ Features

- 🏆 **Global Leaderboards** - View champions across all tracks and weekly challenges
- 📅 **Weekly Challenges** - Special featured tracks with competitive rankings
- ⚡ **Real-time Updates** - Live leaderboard updates without page refresh
- 🎮 **User Authentication** - Secure login and user management
- 📊 **Personal Statistics** - Track your progress and personal bests
- 🎨 **Modern UI** - Beautiful glassmorphism design with TrackMania theming
- 🐳 **Docker Ready** - Full containerized development and production setup
- 📱 **Responsive Design** - Works perfectly on all devices

## 🚀 Quick Start

### Development (Hot Reloading)

```bash
# Clone the repository
git clone <your-repo-url>
cd trackmania-scoreboard

# Start all services with hot reloading
docker-compose -f docker-compose.dev.yml up --build

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001/api
```

### Production

```bash
# Start production services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/api
```

## 🎮 Demo Login

For quick testing, use these pre-configured demo accounts:

- **Email**: `speed@trackmania.com`
- **Password**: `password123`

## 🏗️ Architecture

### Frontend (React + Vite)

- **React 18** with TypeScript
- **Vite** for lightning-fast hot reloading
- **TanStack Query** for server state management
- **React Hook Form + Zod** for form validation
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend (Express + TypeScript)

- **Express.js** with TypeScript
- **Passport.js** for authentication (Local + JWT strategies)
- **MongoDB** with Mongoose ODM
- **Redis** for caching
- **bcryptjs** for password hashing
- **Rate limiting** and security middleware

### Database

- **MongoDB** for persistent data storage
- **Redis** for caching and session management
- **Automatic data seeding** with demo tracks and users

## 📁 Project Structure

```
trackmania-scoreboard/
├── src/                          # Frontend React app
│   ├── components/              # Reusable components
│   ├── pages/                   # Page components
│   ├── hooks/                   # Custom React hooks
│   ├── services/                # API client
│   ├── utils/                   # Utility functions
│   └── types/                   # TypeScript definitions
├── backend/                     # Backend Express app
│   ├── src/
│   │   ├── routes/             # API routes
│   │   ├── models/             # Database models
│   │   ├── middleware/         # Express middleware
│   │   ├── config/             # Configuration files
│   │   └── utils/              # Backend utilities
│   └── package.json
├── docker-compose.yml          # Production setup
├── docker-compose.dev.yml      # Development setup
└── README.md
```

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Tracks & Leaderboards

- `GET /api/tracks` - Get all tracks
- `GET /api/tracks/:id/leaderboard` - Get track leaderboard
- `GET /api/tracks/weekly-challenge` - Get weekly challenge
- `GET /api/tracks/global-leaderboard` - Get global rankings

### Scores

- `POST /api/scores/submit` - Submit a new time
- `DELETE /api/scores/track/:trackId` - Delete user's time
- `GET /api/scores/my-scores` - Get user's scores

## 🔧 Development

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Git

### Local Development Setup

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Start development servers
docker-compose -f docker-compose.dev.yml up --build

# Or run locally (requires MongoDB & Redis)
npm run dev              # Frontend
cd backend && npm run dev # Backend
```

### Environment Variables

Create `.env` files as needed:

```bash
# Backend (.env)
NODE_ENV=development
JWT_SECRET=your-jwt-secret
DATABASE_URL=mongodb://mongodb-dev:27017/trackmania-scoreboard-dev
REDIS_URL=redis://redis-dev:6379
```

## 🚀 Deployment

### Docker Production

The easiest way to deploy is using Docker:

```bash
# Clone repository
git clone <your-repo-url>
cd trackmania-scoreboard

# Start production containers
docker-compose up -d --build

# Your app will be available at:
# Frontend: http://your-domain:3000
# Backend API: http://your-domain:3001/api
```

### Cloud Deployment Options

#### DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure build settings:
   - **Frontend**: Static site from `/` with build command `npm run build`
   - **Backend**: Web service from `/backend` with start command `npm start`
3. Add MongoDB and Redis databases
4. Set environment variables

#### AWS ECS/Fargate

1. Push images to ECR
2. Create ECS services for frontend and backend
3. Configure RDS (MongoDB) and ElastiCache (Redis)
4. Set up Application Load Balancer

#### Heroku

1. Create separate apps for frontend and backend
2. Add MongoDB Atlas and Redis Cloud add-ons
3. Configure environment variables
4. Deploy via Git

## 🏆 Track Types

- **Campaign Maps** - Official TrackMania Summer 2025 campaign (25 tracks)
- **Weekly Maps** - Weekly challenge tracks (Week 32: 5 tracks)
- **Weekly Challenge** - Featured track of the week with special rankings

## 🎯 Global Leaderboards

- **Global Champions** - Most first place finishes across all tracks
- **Weekly Champions** - Most weekly challenge victories
- **Most Active** - Players with the most submitted times

## 🔐 Security Features

- **JWT Authentication** with secure token handling
- **Password hashing** with bcryptjs
- **Rate limiting** to prevent abuse
- **CORS protection** for API security
- **Helmet.js** for security headers
- **Input validation** with Zod schemas

## 🎨 UI/UX Features

- **Glassmorphism design** with TrackMania theming
- **Responsive layout** for all screen sizes
- **Smooth animations** and transitions
- **Real-time updates** without page refresh
- **Elegant time formatting** (MM:SS.mmm)
- **Medal system** (Author, Gold, Silver, Bronze)
- **Intuitive score deletion** with slide animations

## 📊 Performance

- **MongoDB** for efficient data storage
- **Redis caching** for fast responses
- **React Query** for optimized API calls
- **Vite HMR** for instant development updates
- **Docker optimization** with multi-stage builds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🏁 Get Racing!

Ready to track your TrackMania times? Clone the repo and start racing! 🚗💨

---

**Built with ❤️ for the TrackMania community**
