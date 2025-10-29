import { Router } from 'express';
import { userControllers } from './User.controllers';
import { auth } from '../../middlewares/Auth.middleware';

const router = Router();

// Get current user profile (protected route)
router.get('/me', auth, userControllers.getMe);

export const userRoutes = router;
