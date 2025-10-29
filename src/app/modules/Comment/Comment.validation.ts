import { z } from 'zod';
import { ReactionType, SortType } from './Comment.constants';

// Create comment validation
export const createCommentSchema = z.object({
  body: z.object({
    content: z
      .string({
        required_error: 'Content is required',
      })
      .min(1, 'Comment cannot be empty')
      .max(2000, 'Comment cannot exceed 2000 characters')
      .trim(),
    parentCommentId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid comment ID format')
      .optional(),
  }),
});

// Update comment validation
export const updateCommentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid comment ID format'),
  }),
  body: z.object({
    content: z
      .string({
        required_error: 'Content is required',
      })
      .min(1, 'Comment cannot be empty')
      .max(2000, 'Comment cannot exceed 2000 characters')
      .trim(),
  }),
});

// Get comments query validation
export const getCommentsSchema = z.object({
  query: z.object({
    cursor: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid cursor format').optional(),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .refine((n) => n > 0 && n <= 100, 'Limit must be between 1 and 100')
      .optional(),
    sortBy: z.nativeEnum(SortType).optional(),
  }),
});

// Get comment by ID validation
export const getCommentByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid comment ID format'),
  }),
});

// Delete comment validation
export const deleteCommentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid comment ID format'),
  }),
});

// Get replies validation
export const getRepliesSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid comment ID format'),
  }),
  query: z.object({
    cursor: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid cursor format').optional(),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .refine((n) => n > 0 && n <= 100, 'Limit must be between 1 and 100')
      .optional(),
  }),
});

// Toggle reaction validation
export const toggleReactionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid comment ID format'),
  }),
  body: z.object({
    type: z.nativeEnum(ReactionType, {
      required_error: 'Reaction type is required',
    }),
  }),
});
