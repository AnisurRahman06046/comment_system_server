import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../config';
import { UserRole } from '../modules/User/User.constants';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { ApiError } from '../Errors/ApiError';
// create token
const generateToken = async (payload: Record<string, unknown>):Promise<string> => {
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

export const auth =
  (...requiredRoles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }
      let verifiedUser = null;
      verifiedUser = (await verifyToken(
        token,
        config.jwt.secret as Secret,
      )) as JwtPayload & { role: UserRole };
      req.user = verifiedUser;
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
      }
      next();
    } catch (error) {
      next(error);
    }
  };

export const authToken = { generateToken, verifyToken };
