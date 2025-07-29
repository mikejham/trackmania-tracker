import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "./env";
import { User } from "../models/User";

// Mock user storage (in production, this would be a database)
const users: any[] = [
  {
    id: "user_demo_1",
    username: "SpeedDemon",
    email: "speed@trackmania.com",
    password: "$2a$12$xRJvTdVIzkF58akwYKfnCejS5Y.7gKIRag7c.11f568yEsYq8eJJC", // password123
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user_demo_2",
    username: "RaceKing",
    email: "race@trackmania.com",
    password: "$2a$12$xRJvTdVIzkF58akwYKfnCejS5Y.7gKIRag7c.11f568yEsYq8eJJC", // password123
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user_demo_3",
    username: "TestUser3",
    email: "test3@example.com",
    password: "$2a$12$xRJvTdVIzkF58akwYKfnCejS5Y.7gKIRag7c.11f568yEsYq8eJJC", // password123
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Local Strategy for login
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done: any) => {
      try {
        // Find user by email in MongoDB
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
          return done(null, false, { message: "Invalid email or password" });
        }

        // Remove password from user object
        const userWithoutPassword = user.toObject();
        delete (userWithoutPassword as any).password;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// JWT Strategy for protected routes
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwt.secret,
    },
    async (payload: any, done: any) => {
      try {
        // Find user by ID from JWT payload in MongoDB
        const user = await User.findById(payload.userId);

        if (!user) {
          return done(null, false);
        }

        // Remove password from user object
        const userWithoutPassword = user.toObject();
        delete (userWithoutPassword as any).password;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done: any) => {
  done(null, user._id || user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(null, false);
    }

    const userWithoutPassword = user.toObject();
    delete (userWithoutPassword as any).password;
    done(null, userWithoutPassword);
  } catch (error) {
    done(error);
  }
});

// Helper function to hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Helper function to generate JWT token
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
};

// Helper function to verify JWT token
export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.jwt.secret);
};

// Export users array for auth routes to use
export { users };

export default passport;
