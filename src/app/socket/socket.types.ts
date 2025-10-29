import { ICommentResponse } from '../modules/Comment/Comment.interfaces';

/**
 * Socket.io event payload types
 * Defines the structure of data sent with each event
 */

// Comment created event
export interface ICommentNewEvent {
  comment: ICommentResponse;
}

// Comment updated event
export interface ICommentUpdateEvent {
  comment: ICommentResponse;
}

// Comment deleted event
export interface ICommentDeleteEvent {
  commentId: string;
}

// Comment reaction event
export interface ICommentReactionEvent {
  comment: ICommentResponse;
}

// Comment reply event
export interface ICommentReplyEvent {
  comment: ICommentResponse;
  parentCommentId: string;
}

/**
 * Socket data attached to each socket connection
 */
export interface ISocketData {
  userId: string;
  email: string;
}
