import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { THROTTLER_LIMIT } from '@nestjs/throttler/dist/throttler.constants';

describe('AuthController', () => {
  let app: INestApplication;
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    verifyEmail: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('registers a user', async () => {
    authService.register.mockResolvedValueOnce({ message: 'ok' });

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'Password1!', businessName: 'Cafe' })
      .expect(201);
  });

  it('logs in a user', async () => {
    authService.login.mockResolvedValueOnce({ accessToken: 'token' });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'Password1!' })
      .expect(200);
  });

  it('logs out a user', async () => {
    authService.logout.mockResolvedValueOnce({ message: 'ok' });

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', 'Bearer token')
      .expect(200);
  });

  it('has throttling metadata on login', () => {
    const limit = Reflect.getMetadata(THROTTLER_LIMIT, AuthController.prototype.login);
    expect(limit).toBeDefined();
  });
});
