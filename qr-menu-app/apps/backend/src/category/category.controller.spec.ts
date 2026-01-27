import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { ProductService } from '../product/product.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('CategoryController', () => {
  let app: INestApplication;
  const categoryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllWithProducts: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    reorder: jest.fn(),
    updateTranslations: jest.fn(),
  };
  const productService = {
    findByCategory: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        { provide: CategoryService, useValue: categoryService },
        { provide: ProductService, useValue: productService },
      ],
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

  it('creates category', async () => {
    categoryService.create.mockResolvedValueOnce({ id: '1' });
    await request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Coffee' })
      .expect(201);
  });

  it('fetches categories', async () => {
    categoryService.findAll.mockResolvedValueOnce([]);
    await request(app.getHttpServer()).get('/categories?businessId=biz').expect(200);
  });
});
