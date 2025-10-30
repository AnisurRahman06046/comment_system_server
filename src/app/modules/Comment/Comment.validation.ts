import { z } from 'zod';
import { ReactionType, SortType } from './Comment.constants';

// Create comment validation
export const createCommentSchema = z.object({
  body: z.object({
    content: z
      .string({ message: 'Content is required' })
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
      .string({ message: 'Content is required' })
      .min(1, 'Comment cannot be empty')
      .max(2000, 'Comment cannot exceed 2000 characters')
      .trim(),
  }),
});

// Get comments query validation
export const getCommentsSchema = z.object({
  query: z.object({
    cursor: z
      .string()
      .refine(
        (val) => {
          // Accept Base64-encoded JSON cursor
          try {
            const decoded = Buffer.from(val, 'base64').toString('utf8');
            const parsed = JSON.parse(decoded);
            return parsed._id !== undefined;
          } catch {
            // Also accept simple format for backward compatibility
            return /^(\d+_)?[0-9a-fA-F]{24}$/.test(val);
          }
        },
        { message: 'Invalid cursor format' },
      )
      .optional(),
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
      message: 'Reaction type is required',
    }),
  }),
});
