import httpStatus from 'http-status';
import { ApiError } from '../../Errors/ApiError';
import { authToken } from '../../middlewares/Auth.middleware';
import bcrypt from 'bcryptjs';
import { ILoginResponse, IRegisterResponse } from './Auth.types';
import { userServices } from '../User/User.services';
import { RegisterInput, LoginInput } from './Auth.validation';

/**
 * Register a new user
 * @param payload - User registration data
 * @returns User registration response
 */
const register = async (payload: RegisterInput): Promise<IRegisterResponse> => {
  // Check if user already exists
  const userExists = await userServices.isUserExists(payload.email);
  if (userExists) {
    throw new ApiError(httpStatus.CONFLICT, 'User already exists');
  }

  // Create user (password will be hashed by pre-save hook)
  const user = await userServices.createUser(payload);

  return {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
};

/**
 * Login user
 * @param payload - Login credentials
 * @returns JWT token
 */
const login = async (payload: LoginInput): Promise<ILoginResponse> => {
  // Step 1: Find user by email (with password)
  const user = await userServices.getUserByEmail(payload.email);

  // Step 2: Validate user and password
  // Use generic error message to prevent user enumeration
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  // Step 3: Generate JWT token
  const tokenPayload = {
    userId: user._id,
    email: user.email,
  };

  const token = await authToken.generateToken(tokenPayload);

  return { token };
};

export const authServices = {
  register,
  login,
};
