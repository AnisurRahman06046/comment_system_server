import request from 'supertest';
import app from '../app';
import httpStatus = require('http-status');
import { authServices } from '../app/modules/Auth/Auth.services';

jest.mock('../app/modules/Auth/Auth.services', () => ({
  authServices: {
    register: jest.fn(),
    login: jest.fn(),
  },
}));

describe('AUTH ROUTEs', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should return 201 and success message if user is registered successfully', async () => {
      (authServices.register as jest.Mock).mockResolvedValue({
        userName: 'testUser',
      });
      const data = {
        firstName: 'FirstName',
        lastName: 'LastName',
        userName: 'Test User',
        email: 'test@email.com',
        password: 'test@1234',
      };
      const res = await request(app).post('/api/v1/auth/register').send(data);

      expect(res.statusCode).toBe(httpStatus.CREATED);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User is registered successfully');
      expect(res.body.data).toBe('testUser');
    });

    it('should return 500 if user already exists', async () => {
      (authServices.register as jest.Mock).mockRejectedValue(
        new Error('User already exists'),
      );
      const data = {
        firstName: 'FirstName',
        lastName: 'LastName',
        userName: 'Test User',
        email: 'test@email.com',
        password: 'test@1234',
      };
      const res = await request(app).post('/api/v1/auth/register').send(data);

      expect(res.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR); // Assuming you return 409 for conflicts
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User already exists');
    });
  });
});
