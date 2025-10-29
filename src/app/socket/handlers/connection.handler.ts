import { Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../socket.events';
import { ISocketData } from '../socket.types';

/**
 * Handle new socket connection
 * @param socket - Socket instance
 */
export const handleConnection = (socket: Socket) => {
  const user = socket.data.user as ISocketData;

  console.log(`✅ User connected: ${user.email} (ID: ${user.userId})`);

  // Handle disconnection
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    handleDisconnect(socket);
  });
};

/**
 * Handle socket disconnection
 * @param socket - Socket instance
 */
export const handleDisconnect = (socket: Socket) => {
  const user = socket.data.user as ISocketData;
  console.log(`❌ User disconnected: ${user.email} (ID: ${user.userId})`);
};
