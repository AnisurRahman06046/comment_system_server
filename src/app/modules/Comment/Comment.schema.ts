import { Schema, model, Document } from 'mongoose';
import { IComment, IReaction } from './Comment.interfaces';
import { ReactionType } from './Comment.constants';

// Reaction subdocument schema
const reactionSchema = new Schema<IReaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ReactionType),
      required: true,
    },
  },
  { _id: false }, // Don't create separate _id for subdocuments
);

// Comment schema
const commentSchema = new Schema<IComment & Document>(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment author is required'],
    },
    reactions: {
      type: [reactionSchema],
      default: [],
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  },
);

// Indexes for performance
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ createdAt: -1 });
commentSchema.index({ isDeleted: 1 });

// Export the model
export const Comment = model<IComment & Document>('Comment', commentSchema);
