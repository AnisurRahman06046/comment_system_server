import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../config';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { ApiError } from '../Errors/ApiError';

// create token
const generateToken = async (payload: Record<string, unknown>): Promise<string> => {
  return jwt.sign(payload, config.jwt.secret as Secret, {
    expiresIn: config.jwt.expires_in,
  });
};

const verifyToken = async (
  token: string,
  secret: Secret,
): Promise<JwtPayload> => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }
    const verifiedUser = (await verifyToken(
      token,
      config.jwt.secret as Secret,
    )) as JwtPayload;
    req.user = verifiedUser;
    next();
  } catch (error) {
    next(error);
  }
};

export const authToken = { generateToken, verifyToken };
