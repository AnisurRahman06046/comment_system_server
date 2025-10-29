import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendApiResponse from '../../utils/sendApiResponse';
import { userServices } from './User.services';

/**
 * Get current user profile
 * GET /users/me
 */
const getMe = catchAsync(async (req, res) => {
  const userId = req.user?.userId;

  const user = await userServices.getUserById(userId);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile retrieved successfully',
    data: user,
  });
});

export const userControllers = {
  getMe,
};
