import httpStatus from 'http-status';
import { ApiError } from '../../Errors/ApiError';
import { Comment } from './Comment.schema';
import { ICommentResponse, IPaginatedComments } from './Comment.interfaces';
import { SortType, ReactionType } from './Comment.constants';
import { Types } from 'mongoose';
import {
  ICreateCommentRequest,
  IUpdateCommentRequest,
  IGetCommentsQuery,
  IGetRepliesQuery,
} from './Comment.types';
import { buildCursorQuery, formatCursorPaginationResult } from '../../utils/pagination';

/**
 * Create a new comment
 * @param userId - ID of the user creating the comment
 * @param payload - Comment data
 * @returns Created comment
 */
const createComment = async (
  userId: string,
  payload: ICreateCommentRequest,
): Promise<ICommentResponse> => {
  const { content, parentCommentId } = payload;

  // If this is a reply, verify parent comment exists
  if (parentCommentId) {
    const parentComment = await Comment.findOne({
      _id: parentCommentId,
      isDeleted: false,
    });
    if (!parentComment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Parent comment not found');
    }
  }

  const comment = await Comment.create({
    content,
    author: userId,
    parentComment: parentCommentId || null,
  });

  // Populate author and return formatted response
  const populatedComment = await Comment.findById(comment._id)
    .populate('author', 'firstName lastName email')
    .lean();

  if (!populatedComment) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create comment');
  }

  return formatCommentResponse(populatedComment);
};

/**
 * Get comments with cursor-based pagination and sorting
 * @param query - Query parameters
 * @returns Paginated comments
 */
const getComments = async (query: IGetCommentsQuery): Promise<IPaginatedComments> => {
  const { cursor, limit = 10, sortBy = SortType.NEWEST } = query;

  // Build base query for root comments only
  const baseQuery = {
    isDeleted: false,
    parentComment: null, // Only root comments (not replies)
  };

  // Build query with cursor
  const queryConditions = buildCursorQuery(cursor, baseQuery);

  // Build sort criteria
  let sortCriteria: any = {};
  if (sortBy === SortType.NEWEST) {
    sortCriteria = { createdAt: -1 };
  }
  // Note: For MOST_LIKED and MOST_DISLIKED, we'll implement in PHASE 4
  // as it requires aggregation to count reactions

  const comments = await Comment.find(queryConditions)
    .populate('author', 'firstName lastName email')
    .sort(sortCriteria)
    .limit(limit + 1) // Fetch one extra to check if there are more
    .lean();

  // Format pagination result using utility
  const paginationResult = formatCursorPaginationResult(comments, limit);

  return {
    data: paginationResult.data.map(formatCommentResponse),
    nextCursor: paginationResult.nextCursor,
    hasMore: paginationResult.hasMore,
  };
};

/**
 * Get a single comment by ID
 * @param commentId - Comment ID
 * @returns Comment
 */
const getCommentById = async (commentId: string): Promise<ICommentResponse> => {
  const comment = await Comment.findOne({
    _id: commentId,
    isDeleted: false,
  })
    .populate('author', 'firstName lastName email')
    .lean();

  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  return formatCommentResponse(comment);
};

/**
 * Update a comment
 * @param commentId - Comment ID
 * @param userId - ID of user making the request
 * @param payload - Update data
 * @returns Updated comment
 */
const updateComment = async (
  commentId: string,
  userId: string,
  payload: IUpdateCommentRequest,
): Promise<ICommentResponse> => {
  const { content } = payload;

  const comment = await Comment.findOne({
    _id: commentId,
    isDeleted: false,
  });

  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // Check if user is the author
  if (comment.author.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only edit your own comments');
  }

  comment.content = content;
  await comment.save();

  const updatedComment = await Comment.findById(comment._id)
    .populate('author', 'firstName lastName email')
    .lean();

  return formatCommentResponse(updatedComment!);
};

/**
 * Delete a comment (soft delete)
 * @param commentId - Comment ID
 * @param userId - ID of user making the request
 */
const deleteComment = async (commentId: string, userId: string): Promise<void> => {
  const comment = await Comment.findOne({
    _id: commentId,
    isDeleted: false,
  });

  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // Check if user is the author
  if (comment.author.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only delete your own comments');
  }

  comment.isDeleted = true;
  await comment.save();
};

/**
 * Get replies for a comment
 * @param parentCommentId - Parent comment ID
 * @param query - Query parameters
 * @returns Paginated replies
 */
const getReplies = async (
  parentCommentId: string,
  query: IGetRepliesQuery,
): Promise<IPaginatedComments> => {
  const { cursor, limit = 10 } = query;

  // Verify parent comment exists
  const parentComment = await Comment.findOne({
    _id: parentCommentId,
    isDeleted: false,
  });

  if (!parentComment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Parent comment not found');
  }

  // Build base query for replies
  const baseQuery = {
    isDeleted: false,
    parentComment: parentCommentId,
  };

  // Build query with cursor
  const queryConditions = buildCursorQuery(cursor, baseQuery);

  const replies = await Comment.find(queryConditions)
    .populate('author', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .lean();

  // Format pagination result using utility
  const paginationResult = formatCursorPaginationResult(replies, limit);

  return {
    data: paginationResult.data.map(formatCommentResponse),
    nextCursor: paginationResult.nextCursor,
    hasMore: paginationResult.hasMore,
  };
};

/**
 * Helper function to format comment response
 */
const formatCommentResponse = (comment: any): ICommentResponse => {
  const likesCount = comment.reactions?.filter(
    (r: any) => r.type === ReactionType.LIKE,
  ).length || 0;

  const dislikesCount = comment.reactions?.filter(
    (r: any) => r.type === ReactionType.DISLIKE,
  ).length || 0;

  return {
    _id: comment._id.toString(),
    content: comment.content,
    author: {
      _id: comment.author._id.toString(),
      firstName: comment.author.firstName,
      lastName: comment.author.lastName,
      email: comment.author.email,
    },
    likesCount,
    dislikesCount,
    parentComment: comment.parentComment?.toString() || null,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
};

/**
 * Toggle reaction (like/dislike) on a comment
 * Logic:
 * - If user hasn't reacted: Add reaction
 * - If user reacted with same type: Remove reaction (toggle off)
 * - If user reacted with different type: Switch reaction
 * Ensures one user can only have ONE reaction per comment
 * @param commentId - Comment ID
 * @param userId - User ID from token
 * @param reactionType - LIKE or DISLIKE
 * @returns Updated comment
 */
const toggleReaction = async (
  commentId: string,
  userId: string,
  reactionType: ReactionType,
): Promise<ICommentResponse> => {
  const comment = await Comment.findOne({
    _id: commentId,
    isDeleted: false,
  });

  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // Find existing reaction from this user
  const existingReactionIndex = comment.reactions.findIndex(
    (r) => r.userId.toString() === userId,
  );

  if (existingReactionIndex !== -1) {
    // User has already reacted
    const existingReaction = comment.reactions[existingReactionIndex];

    if (existingReaction.type === reactionType) {
      // Same reaction type - remove it (toggle off)
      comment.reactions.splice(existingReactionIndex, 1);
    } else {
      // Different reaction type - switch it
      comment.reactions[existingReactionIndex].type = reactionType;
    }
  } else {
    // User hasn't reacted yet - add new reaction
    comment.reactions.push({
      userId: new Types.ObjectId(userId),
      type: reactionType,
    });
  }

  await comment.save();

  // Return formatted comment with updated reaction counts
  const updatedComment = await Comment.findById(comment._id)
    .populate('author', 'firstName lastName email')
    .lean();

  return formatCommentResponse(updatedComment!);
};

export const commentServices = {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
  getReplies,
  toggleReaction,
};
