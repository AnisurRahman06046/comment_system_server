import { SortType, ReactionType } from './Comment.constants';

/**
 * Request types for Comment operations
 */

// Create comment request
export type ICreateCommentRequest = {
  content: string;
  parentCommentId?: string;
};

// Update comment request
export type IUpdateCommentRequest = {
  content: string;
};

// Get comments query parameters
export type IGetCommentsQuery = {
  cursor?: string;
  limit?: number;
  sortBy?: SortType;
};

// Get replies query parameters
export type IGetRepliesQuery = {
  cursor?: string;
  limit?: number;
};

// Toggle reaction request
export type IToggleReactionRequest = {
  type: ReactionType;
};
