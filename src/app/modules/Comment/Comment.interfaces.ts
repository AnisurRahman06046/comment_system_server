import { Types } from 'mongoose';
import { ReactionType } from './Comment.constants';

/**
 * Reaction interface
 * Represents a single like/dislike on a comment
 */
export interface IReaction {
  userId: Types.ObjectId; // Reference to User who reacted
  type: ReactionType; // LIKE or DISLIKE
}

/**
 * Comment interface (database schema)
 * Represents the full comment document in MongoDB
 */
export interface IComment {
  content: string; // Comment text content
  author: Types.ObjectId; // Reference to User who created the comment
  reactions: IReaction[]; // Array of reactions (likes/dislikes)
  parentComment?: Types.ObjectId | null; // Reference to parent comment (for replies)
  isDeleted: boolean; // Soft delete flag
  createdAt: Date; // Auto-generated timestamp
  updatedAt: Date; // Auto-generated timestamp
}

/**
 * Comment response interface (API response)
 * Represents comment data returned to clients
 */
export interface ICommentResponse {
  _id: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  likesCount: number; // Computed from reactions
  dislikesCount: number; // Computed from reactions
  parentComment?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Paginated comments response
 */
export interface IPaginatedComments {
  data: ICommentResponse[];
  nextCursor: string | null; // Next page cursor (_id of last comment)
  hasMore: boolean; // Whether there are more comments
}
