import { Router } from "express";
import { z } from "zod";
import { logger } from "../utils/logger";
import passport from "../config/passport";
import { generateToken } from "../config/passport";
import { User } from "../models/User";
import { Score } from "../models/Score";

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be less than 30 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Register user
router.post("/register", async (req, res) => {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: validatedData.email },
        { username: validatedData.username },
      ],
    });

    if (existingUser) {
      logger.warn("Registration failed - user already exists", {
        email: validatedData.email,
        username: validatedData.username,
        ip: req.ip,
      });
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    // Create new user
    const user = new User({
      username: validatedData.username,
      email: validatedData.email,
      password: validatedData.password, // Will be hashed by pre-save hook
    });

    await user.save();

    // Generate JWT token
    const token = generateToken((user as any)._id.toString());

    logger.info("User registered successfully", {
      userId: (user as any)._id.toString(),
      username: user.username,
      email: user.email,
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: (user as any)._id.toString(),
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("Registration validation failed", {
        errors: error.errors,
        ip: req.ip,
      });
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }

    logger.error("Registration error", {
      error: (error as Error).message,
      ip: req.ip,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body);

    // Check if user exists
    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      logger.warn("Login failed - user not found", {
        email: validatedData.email,
        ip: req.ip,
      });
      return res.status(400).json({
        success: false,
        message:
          "User not found. Please check your email or register a new account.",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      logger.warn("Login failed - invalid password", {
        email: validatedData.email,
        ip: req.ip,
      });
      return res.status(400).json({
        success: false,
        message: "Invalid password. Please try again.",
      });
    }

    // Generate JWT token
    const token = generateToken((user as any)._id.toString());

    logger.info("User logged in successfully", {
      userId: (user as any)._id.toString(),
      username: user.username,
      email: user.email,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: (user as any)._id.toString(),
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("Login validation failed", {
        errors: error.errors,
        ip: req.ip,
      });
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }

    logger.error("Login error", {
      error: (error as Error).message,
      ip: req.ip,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get current user
router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = req.user as any;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Get fresh user data from database
      const freshUser = await User.findById(user._id || user.id).select(
        "-password"
      );
      if (!freshUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: (freshUser as any)._id.toString(),
            username: freshUser.username,
            email: freshUser.email,
            createdAt: freshUser.createdAt,
            updatedAt: freshUser.updatedAt,
          },
        },
      });
    } catch (error) {
      logger.error("Get current user error", {
        error: (error as Error).message,
        ip: req.ip,
      });
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Logout user
router.post("/logout", (req, res) => {
  // In a JWT-based system, logout is handled client-side by removing the token
  // But we can log the logout attempt
  logger.info("User logout", {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

// Get stats
router.get("/stats", async (req, res) => {
  try {
    const [totalUsers, totalRecords] = await Promise.all([
      User.countDocuments(),
      Score.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalRecords,
        bestTime: "--", // We'll calculate this when we update the scores route
      },
    });
  } catch (error) {
    logger.error("Get stats error", {
      error: (error as Error).message,
      ip: req.ip,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export { router as authRoutes };
