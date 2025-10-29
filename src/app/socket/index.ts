import { Server } from 'socket.io';
import { socketAuthMiddleware } from './socket.middleware';
import { handleConnection } from './handlers/connection.handler';
import { SOCKET_EVENTS } from './socket.events';
import { socketEmitter } from '../utils/socketEmitter';

/**
 * Initialize Socket.io server
 * Sets up authentication middleware and event handlers
 * @param io - Socket.io server instance
 */
export const initializeSocket = (io: Server) => {
  // Set global Socket.io instance for emitter
  socketEmitter.setIO(io);

  // Apply JWT authentication middleware
  io.use(socketAuthMiddleware);

  // Handle new connections
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    handleConnection(socket);
  });

  console.log('🔌 Socket.io initialized with JWT authentication');
};
