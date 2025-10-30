import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendApiResponse from '../../utils/sendApiResponse';
import { commentServices } from './Comment.services';

/**
 * Create a new comment
 * POST /comments
 */
const createComment = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  const result = await commentServices.createComment(userId, req.body);

  sendApiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Comment created successfully',
    data: result,
  });
});

/**
 * Get all comments with pagination and sorting
 * GET /comments?cursor=xxx&limit=10&sortBy=newest
 */
const getComments = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  const query = {
    cursor: req.query.cursor as string | undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    sortBy: req.query.sortBy as any,
  };

  const result = await commentServices.getComments(query, userId);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comments retrieved successfully',
    data: result,
  });
});

/**
 * Get a single comment by ID
 * GET /comments/:id
 */
const getCommentById = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  const result = await commentServices.getCommentById(req.params.id, userId);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment retrieved successfully',
    data: result,
  });
});

/**
 * Update a comment
 * PATCH /comments/:id
 */
const updateComment = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  const result = await commentServices.updateComment(req.params.id, userId, req.body);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment updated successfully',
    data: result,
  });
});

/**
 * Delete a comment
 * DELETE /comments/:id
 */
const deleteComment = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  await commentServices.deleteComment(req.params.id, userId);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment deleted successfully',
    data: null,
  });
});

/**
 * Get replies for a comment
 * GET /comments/:id/replies?cursor=xxx&limit=10
 */
const getReplies = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  const query = {
    cursor: req.query.cursor as string | undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
  };

  const result = await commentServices.getReplies(req.params.id, query, userId);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Replies retrieved successfully',
    data: result,
  });
});

/**
 * Toggle reaction (like/dislike) on a comment
 * POST /comments/:id/reaction
 */
const toggleReaction = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  const result = await commentServices.toggleReaction(
    req.params.id,
    userId,
    req.body.type,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reaction updated successfully',
    data: result,
  });
});

export const commentControllers = {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
  getReplies,
  toggleReaction,
};
