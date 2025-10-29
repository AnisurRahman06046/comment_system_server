import { Router } from 'express';
import { commentControllers } from './Comment.controllers';
import { auth } from '../../middlewares/Auth.middleware';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  createCommentSchema,
  updateCommentSchema,
  getCommentsSchema,
  getCommentByIdSchema,
  deleteCommentSchema,
  getRepliesSchema,
} from './Comment.validation';

const router = Router();

// Create comment (protected)
router.post(
  '/',
  auth,
  validateRequest(createCommentSchema),
  commentControllers.createComment,
);

// Get all comments (protected)
router.get(
  '/',
  auth,
  validateRequest(getCommentsSchema),
  commentControllers.getComments,
);

// Get single comment (protected)
router.get(
  '/:id',
  auth,
  validateRequest(getCommentByIdSchema),
  commentControllers.getCommentById,
);

// Update comment (protected - only author)
router.patch(
  '/:id',
  auth,
  validateRequest(updateCommentSchema),
  commentControllers.updateComment,
);

// Delete comment (protected - only author)
router.delete(
  '/:id',
  auth,
  validateRequest(deleteCommentSchema),
  commentControllers.deleteComment,
);

// Get replies for a comment (protected)
router.get(
  '/:id/replies',
  auth,
  validateRequest(getRepliesSchema),
  commentControllers.getReplies,
);

export const commentRoutes = router;
