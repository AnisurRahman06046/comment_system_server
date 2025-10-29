import { Server } from 'socket.io';

/**
 * Singleton Socket.io instance
 * Used to emit events from anywhere in the application (services, controllers)
 */
class SocketEmitter {
  private io: Server | null = null;

  /**
   * Initialize the Socket.io instance
   * Called once during server startup
   */
  setIO(ioInstance: Server) {
    this.io = ioInstance;
  }

  /**
   * Get the Socket.io instance
   */
  getIO(): Server | null {
    return this.io;
  }

  /**
   * Emit event to all connected clients
   * @param event - Event name
   * @param data - Event payload
   */
  emit(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    } else {
      console.warn('Socket.io not initialized. Event not emitted:', event);
    }
  }

  /**
   * Emit event to specific room
   * @param room - Room name
   * @param event - Event name
   * @param data - Event payload
   */
  emitToRoom(room: string, event: string, data: any) {
    if (this.io) {
      this.io.to(room).emit(event, data);
    } else {
      console.warn('Socket.io not initialized. Event not emitted:', event);
    }
  }
}

// Export singleton instance
export const socketEmitter = new SocketEmitter();
