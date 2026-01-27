import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('ProductController', () => {
  let app: INestApplication;
  const productService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    bulkDelete: jest.fn(),
    bulkStatusChange: jest.fn(),
    updateTranslations: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: productService }],
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

  it('creates product', async () => {
    productService.create.mockResolvedValueOnce({ id: '1' });
    await request(app.getHttpServer())
      .post('/products')
      .send({ name: 'Latte', price: 3.5, categoryId: 'cat' })
      .expect(201);
  });

  it('fetches products', async () => {
    productService.findAll.mockResolvedValueOnce([]);
    await request(app.getHttpServer()).get('/products?businessId=biz').expect(200);
  });
});
