import { Schema, model, Document } from 'mongoose';
import { IUser } from './User.interfaces';
import bcrypt from 'bcryptjs';
import { UserRole, UserStatus } from './User.constants';
// Define the Mongoose schema for IUser
const userSchema = new Schema<IUser & Document>(
  {
    firstName: {
      type: String,
      required: [true, 'First Name is missing'],
    },
    lastName: {
      type: String,
      required: [true, 'Last Name is missing'],
    },
    userName: {
      type: String,
      required: [true, 'User Name is missing'],
      unique: true, // Ensure unique usernames
    },
    email: {
      type: String,
      required: [true, 'Email is missing'],
      unique: true, // Ensure unique emails
      match: [/\S+@\S+\.\S+/, 'Email is invalid'], // Simple email validation
    },
    password: {
      type: String,
      required: [true, 'Password is missing'],
    },
    role: {
      type: [String],
      enum: Object.values(UserRole),
      default: [UserRole.USER],
    },
    presentAddress: {
      type: {
        street: String,
        city: String,
        state: String,
        postCode: String,
        country: String,
      },
      required: false,
    },
    permanentAddress: {
      type: {
        street: String,
        city: String,
        state: String,
        postCode: String,
        country: String,
      },
      required: false,
    },
    contactInfo: {
      type: {
        phoneNumber: String,
        emergencyContact: String,
      },
      required: false,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING,
    },
    passwordChangedCount: {
      type: Number,
      default: 0,
    },
    passwordHistory: [
      {
        oldPassword: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    loginCount: {
      type: Number,
      default: 0,
    },
    loginHistory: [
      {
        ipAddress: String,
        loginAt: {
          type: Date,
          default: Date.now,
        },
        default: [], 
      },
    ],
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
