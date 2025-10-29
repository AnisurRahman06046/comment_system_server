import { Socket } from 'socket.io';
import { authToken } from '../middlewares/Auth.middleware';
import config from '../config';
import { ISocketData } from './socket.types';

/**
 * Socket.io authentication middleware
 * Verifies JWT token when client connects
 * Reuses existing authToken.verifyToken for consistency
 */
export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    // Get token from handshake auth
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify token using existing auth utility
    const decoded = await authToken.verifyToken(token, config.jwt.secret as string);

    // Attach user data to socket
    socket.data.user = {
      userId: decoded.userId,
      email: decoded.email,
    } as ISocketData;

    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};
