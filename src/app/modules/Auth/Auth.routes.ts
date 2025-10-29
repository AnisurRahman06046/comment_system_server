import { Router } from 'express';
import { authControllers } from './Auth.controllers';
import { validateRequest } from '../../middlewares/validateRequest';
import { registerSchema, loginSchema } from './Auth.validation';

const router = Router();

router.post('/register', validateRequest(registerSchema), authControllers.register);
router.post('/login', validateRequest(loginSchema), authControllers.login);

export const authRoutes = router;
