import cors, { CorsOptions } from 'cors';
import config from '../config';

/**
 * CORS configuration for the application
 * Allows requests from specified origins with credentials
 */

// Parse allowed origins from environment variable
const getAllowedOrigins = (): string[] => {
  const origins = config.cors_origin || 'http://localhost:3000';
  return origins.split(',').map((origin) => origin.trim());
};

const allowedOrigins = getAllowedOrigins();

/**
 * CORS options configuration
 */
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      // Reject the origin by not setting CORS headers (browser will block)
      callback(null, false);
    }
  },
  credentials: true, // Allow cookies and authentication headers
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'], // Expose rate limit headers
  maxAge: 86400, // Cache preflight requests for 24 hours
};

/**
 * CORS middleware with secure configuration
 */
export const corsMiddleware = cors(corsOptions);
