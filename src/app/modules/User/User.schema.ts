import { Schema, model, Document } from 'mongoose';
import { IUser } from './User.interfaces';
import bcrypt from 'bcryptjs';

// Define the Mongoose schema for IUser
const userSchema = new Schema<IUser & Document>(
  {
    firstName: {
      type: String,
      required: [true, 'First Name is missing'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last Name is missing'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is missing'],
      unique: true, // Ensure unique emails
      lowercase: true, // Always store email in lowercase
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Email is invalid'], // Simple email validation
    },
    password: {
      type: String,
      required: [true, 'Password is missing'],
      select: false, // Don't return password in queries by default
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  },
);

userSchema.pre<IUser & Document>('save', async function (next) {
  // only hash if the password is modified or new
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error('An unknown error occurred during password hashing'));
    }
  }
});
// Export the model based on the schema
export const User = model<IUser & Document>('User', userSchema);
