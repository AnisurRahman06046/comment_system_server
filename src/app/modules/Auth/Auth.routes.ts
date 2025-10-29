import { Router } from 'express';
import { userControllers } from './Auth.controllers';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - userName
 *         - email
 *         - password
 *       properties:
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         userName:
 *           type: string
 *           example: johndoe
 *         email:
 *           type: string
 *           example: johndoe@example.com
 *         password:
 *           type: string
 *           example: password123
 *         role:
 *           type: array
 *           items:
 *             type: string
 *           enum: [ADMIN, USER, MODERATOR]
 *           default: [USER]
 *           example: [USER]
 *         presentAddress:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *               example: 123 Main St
 *             city:
 *               type: string
 *               example: Springfield
 *             state:
 *               type: string
 *               example: IL
 *             postCode:
 *               type: string
 *               example: 62704
 *             country:
 *               type: string
 *               example: USA
 *         permanentAddress:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *               example: 456 Elm St
 *             city:
 *               type: string
 *               example: Springfield
 *             state:
 *               type: string
 *               example: IL
 *             postCode:
 *               type: string
 *               example: 62704
 *             country:
 *               type: string
 *               example: USA
 *         contactInfo:
 *           type: object
 *           properties:
 *             phoneNumber:
 *               type: string
 *               example: 555-123-4567
 *             emergencyContact:
 *               type: string
 *               example: Jane Doe
 *         status:
 *           type: string
 *           enum: [PENDING, ACTIVE, SUSPENDED]
 *           default: PENDING
 *           example: PENDING
 *         passwordChangedCount:
 *           type: number
 *           default: 0
 *           example: 2
 *         passwordHistory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: oldpassword123
 *               changedAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2023-08-01T12:34:56.789Z
 *         loginCount:
 *           type: number
 *           default: 0
 *           example: 5
 *         loginHistory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               ipAddress:
 *                 type: string
 *                 example: 192.168.1.1
 *               loginAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2023-08-01T12:34:56.789Z
 */

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Register]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
router.post('/register', userControllers.register);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Login]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - password
 *             properties:
 *               userName:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid credentials
 */

router.post('/login', userControllers.login);

export const authRoutes = router;
