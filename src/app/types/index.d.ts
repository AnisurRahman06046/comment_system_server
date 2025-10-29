import { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '../modules/User/User.constants';
 // Adjust the path as needed

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { role: UserRole }; // Add 'user' property with the JwtPayload and role
    }
  }
}

