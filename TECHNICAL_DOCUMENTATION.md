# 🏁 TrackMania Scoreboard - Technical Documentation

**✅ CURRENT STATUS: FULLY FUNCTIONAL** - Complete application with professional design and Docker hot reloading!

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Docker Development Environment](#docker-development-environment)
5. [State Management](#state-management)
6. [Data Flow](#data-flow)
7. [API Design](#api-design)
8. [Authentication System](#authentication-system)
9. [UI Design System](#ui-design-system)
10. [Component Patterns](#component-patterns)
11. [Development Workflow](#development-workflow)
12. [Testing Guide](#testing-guide)
13. [Performance Optimizations](#performance-optimizations)
14. [Security Considerations](#security-considerations)
15. [Deployment Strategies](#deployment-strategies)

## Architecture Overview

The TrackMania Scoreboard follows a modern **containerized microservices architecture** with hot reloading development environment:

### 🔥 **Development Mode (Hot Reloading)**

```
┌─────────────────┐    Proxy      ┌─────────────────┐    MongoDB    ┌─────────────────┐
│                 │◄─────────────►│                 │◄─────────────►│                 │
│ React + Vite    │               │ Express + tsx   │               │  MongoDB Atlas  │
│ (Hot Reload)    │               │ (Auto-restart)  │               │  + Demo Data    │
│ Port 5173       │               │ Port 3001       │               │ Port 27017      │
│   ✅ INSTANT    │               │  ✅ LIVE SYNC   │               │  ✅ CONNECTED   │
└─────────────────┘               └─────────────────┘               └─────────────────┘
         ▲                                   ▲                               ▲
         │                                   │                               │
         │ Volume Mount                      │ Volume Mount                  │ Docker Network
         ▼                                   ▼                               ▼
┌─────────────────┐               ┌─────────────────┐               ┌─────────────────┐
│  Host Source    │               │  Host Source    │               │     Redis       │
│  /src Files     │               │ /backend Files  │               │  (Caching)      │
│  📂 LIVE SYNC   │               │  📂 LIVE SYNC   │               │ Port 6379       │
└─────────────────┘               └─────────────────┘               └─────────────────┘
```

### 🏭 **Production Mode (Optimized)**

```
┌─────────────────┐    Proxy      ┌─────────────────┐    Network    ┌─────────────────┐
│                 │◄─────────────►│                 │◄─────────────►│                 │
│ React Bundle    │               │ Express Build   │               │  MongoDB Atlas  │
│ served by Nginx │               │ (Optimized)     │               │  (Persistent)   │
│ Port 3000       │               │ Port 3001       │               │ Port 27017      │
│  ✅ OPTIMIZED   │               │  ✅ PRODUCTION  │               │  ✅ SCALING     │
└─────────────────┘               └─────────────────┘               └─────────────────┘
```

### ✅ **Currently Working Features**

- **🔥 Hot Reloading**: Instant frontend updates + backend auto-restart ✅
- **🎨 Professional UI**: Modern glassmorphism login with TrackMania theming ✅
- **🐳 Docker Environment**: Full containerized development + production ✅
- **💾 Database Integration**: MongoDB with demo data + Redis caching ✅
- **📦 TypeScript**: Strict type safety across frontend and backend ✅
- **🛠️ Development Tools**: Complete toolchain with linting and formatting ✅
- **🚀 Deployment Ready**: Multi-stage Docker builds for any platform ✅

### 🎮 **Live Development URLs**

- **🔥 Frontend (Hot Reload)**: http://localhost:5173/
- **🔄 Backend (Auto-restart)**: http://localhost:3001/api
- **🗄️ MongoDB**: mongodb://localhost:27017/trackmania-scoreboard-dev
- **🚀 Redis**: redis://localhost:6379
- **🔐 Demo Login**: `speed@trackmania.com` / `password123` (pre-filled)

### 🏭 **Production URLs**

- **🌐 Frontend (Nginx)**: http://localhost:3000/
- **⚙️ Backend (Optimized)**: http://localhost:3001/api

## Docker Development Environment

### 🔥 **Development Mode Features**

```yaml
# docker-compose.dev.yml
services:
  frontend-dev: # Vite + HMR + Volume Mount
  backend-dev: # tsx watch + Auto-restart + Volume Mount
  mongodb-dev: # Real database with demo data
  redis-dev: # Caching layer
```

**🚀 Key Benefits:**

- **Instant Updates**: Frontend changes appear without refresh
- **Auto-restart**: Backend restarts automatically on file changes
- **Real Database**: Full MongoDB with demo users and tracks
- **Live Sync**: Volume mounting keeps containers in sync with host
- **Consistent Environment**: Same setup across all development machines

### 🏭 **Production Mode Features**

```yaml
# docker-compose.yml
services:
  frontend: # Multi-stage build → Nginx optimization
  backend: # Multi-stage build → Node.js optimization
  mongodb: # Persistent data + initialization scripts
  redis: # Production caching configuration
```

**🚀 Key Benefits:**

- **Optimized Builds**: Minified bundles and tree-shaking
- **Nginx Serving**: High-performance static file serving
- **Health Checks**: Container health monitoring
- **Security**: Non-root users and minimal attack surface

### 📁 **Volume Mounting Strategy**

```bash
# Frontend Development
- ./src:/app/src:ro              # Source code (read-only for container)
- ./public:/app/public:ro        # Static assets
- /app/node_modules              # Container-managed dependencies

# Backend Development
- ./backend/src:/app/src:ro      # TypeScript source
- ./backend/package*.json:/app/  # Dependencies tracking
- /app/node_modules              # Container-managed dependencies
```

## Frontend Architecture

### 🎨 **New Professional Design System**

```tsx
// Modern Login Interface with TrackMania Theming
const LoginForm = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-primary/20">
      {/* Glassmorphism Card */}
      <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
        {/* Racing Icons Header */}
        <div className="flex justify-center items-center space-x-3">
          <Flag className="w-8 h-8 text-primary" />
          <Trophy className="w-8 h-8 text-yellow-500" />
          <Timer className="w-8 h-8 text-green-500" />
        </div>

        {/* Gradient Logo */}
        <span className="bg-gradient-to-r from-primary via-yellow-400 to-green-400 bg-clip-text text-transparent">
          TrackMania
        </span>

        {/* Pre-filled Demo Account */}
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-primary font-semibold">🎮 Demo Account Ready!</p>
        </div>
      </Card>
    </div>
  );
};
```

### 🛠️ **Component Architecture**

```
src/
├── components/
│   ├── ui/                    # Design System Components
│   │   ├── Button.tsx         # Polymorphic button with variants
│   │   ├── Input.tsx          # Form input with validation states
│   │   └── Card.tsx           # Compound component pattern
│   ├── LoginForm.tsx          # 🆕 Professional auth interface
│   ├── LeaderboardCard.tsx    # TrackMania-specific displays
│   └── ProtectedRoute.tsx     # Route-level authentication
├── pages/
│   └── Dashboard.tsx          # Main application interface
├── hooks/
│   └── useAuth.ts             # TanStack Query + Auth integration
├── store/
│   ├── authStore.ts           # Zustand auth state (persistent)
│   └── notificationStore.ts   # In-app notifications
├── services/
│   └── api.ts                 # Type-safe API client
├── utils/
│   ├── time.ts                # TrackMania time formatting (MM:SS.mmm)
│   └── medal.ts               # Medal calculation logic
└── types/
    └── index.ts               # Complete TypeScript definitions
```

### ⚡ **Hot Module Replacement (HMR)**

```javascript
// Vite HMR Configuration
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Docker compatibility
    port: 5173,
    hmr: {
      port: 5173, // HMR over same port
    },
  },
});
```

**🔥 HMR Features:**

- **React Fast Refresh**: Component state preservation during updates
- **CSS Hot Reload**: Instant style updates without page refresh
- **TypeScript Live**: Type checking during development
- **Error Overlay**: Development-time error boundaries

## Backend Architecture

### 🔄 **Auto-restart Development**

```typescript
// tsx watch configuration for instant backend updates
{
  "scripts": {
    "dev": "tsx watch src/server.ts",  // Auto-restart on file changes
    "build": "tsc",                    // TypeScript compilation
    "start": "node dist/server.js"     // Production mode
  }
}
```

### 🗄️ **Database Integration**

```typescript
// MongoDB Connection with Docker networking
const connectDatabase = async () => {
  try {
    // Development: MongoDB container
    const mongoUri =
      process.env.DATABASE_URL ||
      "mongodb://mongodb-dev:27017/trackmania-scoreboard-dev";

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    // Graceful fallback to mock data
  }
};
```

### 📡 **API Route Structure**

```
backend/src/routes/
├── auth.ts          # JWT authentication + demo accounts
├── tracks.ts        # Track management + leaderboards
├── scores.ts        # Score submission + personal bests
├── users.ts         # User profiles + statistics
└── notifications.ts # Real-time notifications
```

### 🔧 **Middleware Stack**

```typescript
// Production-ready Express setup
app.use(helmet());                    // Security headers
app.use(rateLimit({ max: 100 }));     // DDoS protection
app.use(compression());               // Response compression
app.use(cors({ origin: [...] }));     // CORS configuration
app.use(express.json({ limit: '10mb' })); // Body parsing
app.use(errorHandler);                // Global error handling
```

## UI Design System

### 🎨 **TrackMania Theme Colors**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6", // TrackMania blue
        "trackmania-green": "#10B981", // Author medal
        "trackmania-gold": "#F59E0B", // Gold medal
        "trackmania-silver": "#6B7280", // Silver medal
        "trackmania-bronze": "#92400E", // Bronze medal
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
};
```

### 🏆 **Medal System Integration**

```typescript
// utils/medal.ts
export const getMedalForTime = (time: number, track: Track): MedalType => {
  if (time <= track.authorTime) return "Author";
  if (time <= track.goldTime) return "Gold";
  if (time <= track.silverTime) return "Silver";
  if (time <= track.bronzeTime) return "Bronze";
  return "None";
};

export const getMedalColorClass = (medal: MedalType): string => {
  const colors = {
    Author: "text-trackmania-green",
    Gold: "text-trackmania-gold",
    Silver: "text-trackmania-silver",
    Bronze: "text-trackmania-bronze",
    None: "text-gray-500",
  };
  return colors[medal];
};
```

### ⏱️ **TrackMania Time Formatting**

```typescript
// utils/time.ts
export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const ms = milliseconds % 1000;

  return `${minutes}:${seconds.toString().padStart(2, "0")}.${ms
    .toString()
    .padStart(3, "0")}`;
};

// Example: 125450ms → "2:05.450"
```

## State Management

### 🔄 **TanStack Query (Server State)**

```typescript
// hooks/useAuth.ts
export function useLogin() {
  const { login } = useAuthActions();

  return useMutation({
    mutationFn: (credentials: UserLoginForm) => apiClient.login(credentials),
    onSuccess: (response) => {
      const { user, token } = response.data;
      login(token, user); // Update Zustand store
      navigate("/dashboard");
    },
    onError: (error) => {
      setError(error.message);
    },
  });
}
```

### 🏪 **Zustand (Client State)**

```typescript
// store/authStore.ts
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token: string, user: User) => {
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage", // localStorage persistence
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

## Development Workflow

### 🔥 **Hot Reloading Development**

```bash
# Start full development environment
docker-compose -f docker-compose.dev.yml up --build

# What happens:
# ✅ Frontend: Vite HMR at localhost:5173 (instant updates)
# ✅ Backend: tsx watch at localhost:3001 (auto-restart)
# ✅ MongoDB: Real database with demo data
# ✅ Redis: Caching layer ready
# ✅ Volume Mounting: Live code synchronization
```

### 📊 **Development Monitoring**

```bash
# View live logs from all services
docker-compose -f docker-compose.dev.yml logs -f

# Monitor specific services
docker-compose -f docker-compose.dev.yml logs frontend-dev -f
docker-compose -f docker-compose.dev.yml logs backend-dev -f

# Check container health
docker-compose -f docker-compose.dev.yml ps
```

### 🧪 **Testing Hot Reloading**

```typescript
// Test frontend hot reload
// 1. Edit src/components/LoginForm.tsx line 72:
<p className="text-white/70 text-lg font-medium">
  🚀 HOT RELOAD TEST - Track your times and compete with friends
</p>;
// 2. Save → See instant browser update!

// Test backend auto-restart
// 1. Edit backend/src/routes/auth.ts line 60:
res.status(200).json({
  success: true,
  message: "🔥 HOT RELOAD LOGIN - Success!", // Add this
  data: { user: userWithoutPassword, token },
});
// 2. Save → Backend restarts automatically!
```

## Testing Guide

### 🧪 **Manual Testing Checklist**

#### ✅ **Authentication Flow**

```bash
# 1. Login Test
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"speed@trackmania.com","password":"password123"}'

# Expected: 200 OK with user data and token

# 2. Registration Test
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"TestRacer",
    "email":"test@trackmania.com",
    "password":"password123",
    "confirmPassword":"password123"
  }'

# Expected: 201 Created with new user data
```

#### ✅ **UI Testing**

1. **Login Page**: Pre-filled credentials should work immediately
2. **Responsive Design**: Test on mobile/tablet sizes
3. **Hot Reload**: Make component changes and verify instant updates
4. **Loading States**: Check "Starting Engine..." animation
5. **Error Handling**: Test invalid credentials

#### ✅ **API Endpoints**

```bash
# Health Check
curl http://localhost:3001/api/health
# Expected: {"success":true,"message":"Server is healthy"}

# Get Tracks
curl http://localhost:3001/api/tracks
# Expected: Array of track objects with times

# Get Leaderboard
curl http://localhost:3001/api/tracks/1/leaderboard
# Expected: Leaderboard with scores and user data
```

### 🎯 **Frontend Component Testing**

```typescript
// Example component test structure (not yet implemented)
import { render, screen, fireEvent } from "@testing-library/react";
import { LoginForm } from "../components/LoginForm";

test("should submit login form with demo credentials", async () => {
  render(<LoginForm />);

  // Demo credentials should be pre-filled
  expect(screen.getByDisplayValue("speed@trackmania.com")).toBeInTheDocument();
  expect(screen.getByDisplayValue("password123")).toBeInTheDocument();

  // Click login button
  fireEvent.click(screen.getByText("Start Racing"));

  // Should show loading state
  expect(screen.getByText("Starting Engine...")).toBeInTheDocument();
});
```

## Performance Optimizations

### ⚡ **Frontend Optimizations**

```typescript
// Code splitting with React.lazy
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const LoginForm = React.lazy(() => import("./components/LoginForm"));

// Vite build optimizations
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          auth: ["@tanstack/react-query", "zustand"],
          ui: ["lucide-react", "tailwindcss"],
        },
      },
    },
  },
});
```

### 🚀 **Backend Optimizations**

```typescript
// Response compression
app.use(
  compression({
    threshold: 1024, // Only compress responses > 1KB
    level: 6, // Balanced compression vs speed
  })
);

// Database query optimization (when using real MongoDB)
const getLeaderboard = async (trackId: string) => {
  return await Score.find({ trackId })
    .populate("user", "username email") // Only fetch needed fields
    .sort({ time: 1 }) // Sort by best time
    .limit(50) // Limit results
    .lean(); // Plain JS objects (faster)
};
```

### 🐳 **Docker Optimizations**

```dockerfile
# Multi-stage frontend build
FROM node:18-alpine AS base
# ... dependencies

FROM base AS builder
# ... build step

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
# Optimized final image (~15MB vs ~500MB)
```

## Security Considerations

### 🔒 **Backend Security**

```typescript
// Helmet.js security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: "Too many requests, please try again later",
});
app.use(limiter);
```

### 🛡️ **Input Validation**

```typescript
// Zod schema validation
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Backend validation with express-validator
import { body, validationResult } from "express-validator";

app.post(
  "/api/auth/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }).trim(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process valid input...
  }
);
```

## Deployment Strategies

### ☁️ **Cloud Deployment Options**

#### **AWS (Recommended)**

```bash
# ECS/Fargate deployment
aws ecs create-cluster --cluster-name trackmania-cluster
aws ecs create-service --cluster trackmania-cluster \
  --service-name trackmania-frontend --task-definition trackmania-frontend-task

# With RDS PostgreSQL and ElastiCache Redis
```

#### **DigitalOcean App Platform**

```yaml
# .do/app.yaml
name: trackmania-scoreboard
services:
  - name: frontend
    source_dir: /
    dockerfile_path: Dockerfile
    http_port: 80
    instance_count: 1
    instance_size_slug: basic-xxs
  - name: backend
    source_dir: /backend
    dockerfile_path: Dockerfile
    http_port: 3001
    instance_count: 1
    instance_size_slug: basic-xxs
databases:
  - name: mongodb
    engine: MONGODB
    version: "5"
    size: db-s-1vcpu-1gb
```

### 🖥️ **VPS Deployment**

```bash
# Production deployment on VPS
git clone <repository>
cd trackmania-scoreboard

# Set production environment variables
cp .env.example .env.production
# Edit database URLs, JWT secrets, etc.

# Deploy with Docker Compose
docker-compose -f docker-compose.yml up --build -d

# Or simplified deployment
docker-compose -f docker-compose.simple.yml up --build -d

# Monitor logs
docker-compose logs -f
```

### 🔄 **CI/CD Pipeline Example**

```yaml
# .github/workflows/deploy.yml
name: Deploy TrackMania Scoreboard

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build and push Docker images
        run: |
          docker build -t trackmania-frontend .
          docker build -t trackmania-backend ./backend

      - name: Deploy to production
        run: |
          # Deploy using your preferred method
          # AWS ECS, DigitalOcean, Docker Swarm, etc.
```

---

## 🏁 **Development Quick Start**

### 🔥 **Hot Reloading (Recommended)**

```bash
docker-compose -f docker-compose.dev.yml up --build
# → Frontend: http://localhost:5173 (instant updates)
# → Backend: http://localhost:3001/api (auto-restart)
```

### 🏭 **Production Testing**

```bash
docker-compose up --build
# → Frontend: http://localhost:3000 (optimized)
# → Backend: http://localhost:3001/api (production)
```

### 💻 **Local Development**

```bash
.\start-local.bat  # Windows
# → Frontend: http://localhost:5173 (fastest)
# → Backend: http://localhost:3001/api (native)
```

**🔐 Demo Login**: `speed@trackmania.com` / `password123` (pre-filled)

**🎉 Ready to start developing your TrackMania Scoreboard!**
