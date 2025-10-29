import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendApiResponse from '../../utils/sendApiResponse';
import { authServices } from './Auth.services';

const register = catchAsync(async (req, res) => {
  const result = await authServices.register(req.body);
  sendApiResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User is registered successfully',
    data: result?.userName,
  });
});

const login = catchAsync(async (req, res) => {
  const ipAddress =
    req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const result = await authServices.login(req.body, ipAddress as string);
  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is logged in',
    data: result,
  });
});

export const userControllers = { register, login };
