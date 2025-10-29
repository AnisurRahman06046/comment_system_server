/**
 * Socket.io event name constants
 * Centralized event names to prevent typos and ensure consistency
 */
export const SOCKET_EVENTS = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // Comment events
  COMMENT_NEW: 'comment:new',
  COMMENT_UPDATE: 'comment:update',
  COMMENT_DELETE: 'comment:delete',
  COMMENT_REACTION: 'comment:reaction',
  COMMENT_REPLY: 'comment:reply',
} as const;

// Type for event names
export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
