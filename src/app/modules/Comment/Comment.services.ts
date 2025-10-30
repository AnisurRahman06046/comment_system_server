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
import {
  buildCursorQuery,
  formatCursorPaginationResult,
  buildCompoundCursorQuery,
  formatCompoundCursorPaginationResult,
} from '../../utils/pagination';
import { socketEmitter } from '../../utils/socketEmitter';
import { SOCKET_EVENTS } from '../../socket/socket.events';

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

  const formattedComment = formatCommentResponse(populatedComment, userId);

  // Emit real-time event
  if (parentCommentId) {
    socketEmitter.emit(SOCKET_EVENTS.COMMENT_REPLY, {
      comment: formattedComment,
      parentCommentId,
    });
  } else {
    socketEmitter.emit(SOCKET_EVENTS.COMMENT_NEW, { comment: formattedComment });
  }

  return formattedComment;
};

/**
 * Get comments with cursor-based pagination and sorting
 * @param query - Query parameters
 * @param userId - Current user ID (optional)
 * @returns Paginated comments
 */
const getComments = async (query: IGetCommentsQuery, userId?: string): Promise<IPaginatedComments> => {
  const { cursor, limit = 10, sortBy = SortType.NEWEST } = query;

  // For sorting by likes/dislikes, use aggregation
  if (sortBy === SortType.MOST_LIKED || sortBy === SortType.MOST_DISLIKED) {
    return getCommentsWithAggregation(cursor, limit, sortBy, userId);
  }

  // For NEWEST sorting, use simple query
  const baseQuery = {
    isDeleted: false,
    parentComment: null,
  };

  const queryConditions = buildCursorQuery(cursor, baseQuery);

  const comments = await Comment.find(queryConditions)
    .populate('author', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .lean();

  const paginationResult = formatCursorPaginationResult(comments, limit);

  return {
    data: paginationResult.data.map(comment => formatCommentResponse(comment, userId)),
    nextCursor: paginationResult.nextCursor,
    hasMore: paginationResult.hasMore,
  };
};

/**
 * Get comments using aggregation for sorting by reactions
 * Uses compound cursor for proper pagination with sorted results
 * @param cursor - Pagination cursor
 * @param limit - Items per page
 * @param sortBy - Sort type (MOST_LIKED or MOST_DISLIKED)
 * @param userId - Current user ID (optional)
 * @returns Paginated comments
 */
const getCommentsWithAggregation = async (
  cursor: string | undefined,
  limit: number,
  sortBy: SortType,
  userId?: string,
): Promise<IPaginatedComments> => {
  const matchStage: any = {
    isDeleted: false,
    parentComment: null,
  };

  const pipeline: any[] = [
    { $match: matchStage },
    // Step 1: Compute reaction counts
    {
      $addFields: {
        likesCount: {
          $size: {
            $filter: {
              input: '$reactions',
              as: 'reaction',
              cond: { $eq: ['$$reaction.type', ReactionType.LIKE] },
            },
          },
        },
        dislikesCount: {
          $size: {
            $filter: {
              input: '$reactions',
              as: 'reaction',
              cond: { $eq: ['$$reaction.type', ReactionType.DISLIKE] },
            },
          },
        },
      },
    },
  ];

  // Step 2: Apply compound cursor filtering AFTER computing counts (if cursor provided)
  const sortField = sortBy === SortType.MOST_LIKED ? 'likesCount' : 'dislikesCount';
  const cursorQuery = buildCompoundCursorQuery(cursor, sortField, -1);
  if (Object.keys(cursorQuery).length > 0) {
    pipeline.push({ $match: cursorQuery });
  }

  // Step 3: Sort by computed field with _id as tiebreaker
  pipeline.push(
    {
      $sort:
        sortBy === SortType.MOST_LIKED
          ? { likesCount: -1, _id: -1 }
          : { dislikesCount: -1, _id: -1 },
    },
    { $limit: limit + 1 },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
      },
    },
    { $unwind: '$author' },
    {
      $project: {
        'author.password': 0,
      },
    },
  );

  const comments = await Comment.aggregate(pipeline);

  // Step 4: Format pagination with compound cursor using reusable utility
  const paginationResult = formatCompoundCursorPaginationResult(comments, limit, sortField);

  return {
    data: paginationResult.data.map(comment => formatCommentResponse(comment, userId)),
    nextCursor: paginationResult.nextCursor,
    hasMore: paginationResult.hasMore,
  };
};

/**
 * Get a single comment by ID
 * @param commentId - Comment ID
 * @param userId - Current user ID (optional)
 * @returns Comment
 */
const getCommentById = async (commentId: string, userId?: string): Promise<ICommentResponse> => {
  const comment = await Comment.findOne({
    _id: commentId,
    isDeleted: false,
  })
    .populate('author', 'firstName lastName email')
    .lean();

  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  return formatCommentResponse(comment, userId);
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

  const formattedComment = formatCommentResponse(updatedComment!, userId);

  // Emit real-time event
  socketEmitter.emit(SOCKET_EVENTS.COMMENT_UPDATE, { comment: formattedComment });

  return formattedComment;
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

  // Emit real-time event
  socketEmitter.emit(SOCKET_EVENTS.COMMENT_DELETE, { commentId });
};

/**
 * Get replies for a comment
 * @param parentCommentId - Parent comment ID
 * @param query - Query parameters
 * @param userId - Current user ID (optional)
 * @returns Paginated replies
 */
const getReplies = async (
  parentCommentId: string,
  query: IGetRepliesQuery,
  userId?: string,
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
    data: paginationResult.data.map(comment => formatCommentResponse(comment, userId)),
    nextCursor: paginationResult.nextCursor,
    hasMore: paginationResult.hasMore,
  };
};

/**
 * Helper function to format comment response
 * @param comment - Comment document
 * @param userId - Current user ID (optional)
 */
const formatCommentResponse = (comment: any, userId?: string): ICommentResponse => {
  const likesCount = comment.reactions?.filter(
    (r: any) => r.type === ReactionType.LIKE,
  ).length || 0;

  const dislikesCount = comment.reactions?.filter(
    (r: any) => r.type === ReactionType.DISLIKE,
  ).length || 0;

  // Find current user's reaction (if any)
  let userReaction: ReactionType | null = null;
  if (userId && comment.reactions) {
    const userReactionObj = comment.reactions.find(
      (r: any) => r.userId.toString() === userId
    );
    if (userReactionObj) {
      userReaction = userReactionObj.type;
    }
  }

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
    userReaction,
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

  const formattedComment = formatCommentResponse(updatedComment!, userId);

  // Emit real-time event
  socketEmitter.emit(SOCKET_EVENTS.COMMENT_REACTION, { comment: formattedComment });

  return formattedComment;
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
