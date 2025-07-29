import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  database: {
    uri: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    origin: string[];
  };
  upload: {
    maxFileSize: number;
    allowedTypes: string[];
  };
}

function validateEnv(): Config {
  const requiredEnvVars = ["JWT_SECRET"];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  return {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3001", 10),
    database: {
      uri:
        process.env.DATABASE_URL ||
        "mongodb://localhost:27017/trackmania-scoreboard",
    },
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
    cors: {
      origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
    },
    upload: {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10), // 5MB
      allowedTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/octet-stream",
      ],
    },
  };
}

export const config = validateEnv();
