import httpStatus from 'http-status';
import { ApiError } from '../../Errors/ApiError';
import { User } from './User.schema';
import { IUser, IUserResponse } from './User.interfaces';

/**
 * Get user by ID
 * @param userId - User ID
 * @returns User without password
 */
const getUserById = async (userId: string): Promise<IUserResponse> => {
  const user = await User.findById(userId).select('-password').lean();
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return {
    _id: (user._id as any).toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    createdAt: (user as any).createdAt as Date,
    updatedAt: (user as any).updatedAt as Date,
  };
};

/**
 * Get user by email (with password for authentication)
 * @param email - User email
 * @returns User with password
 */
const getUserByEmail = async (email: string) => {
  const user = await User.findOne({ email }).select('+password');
  return user;
};

/**
 * Check if user exists by email
 * @param email - User email
 * @returns Boolean
 */
const isUserExists = async (email: string): Promise<boolean> => {
  const user = await User.findOne({ email });
  return !!user;
};

/**
 * Create new user
 * @param userData - User data
 * @returns Created user without password
 */
const createUser = async (userData: IUser): Promise<IUserResponse> => {
  const user = await User.create(userData);
  const userObj = user.toObject() as any;

  return {
    _id: userObj._id.toString(),
    firstName: userObj.firstName,
    lastName: userObj.lastName,
    email: userObj.email,
    createdAt: userObj.createdAt as Date,
    updatedAt: userObj.updatedAt as Date,
  };
};

export const userServices = {
  getUserById,
  getUserByEmail,
  isUserExists,
  createUser,
};
