import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CategoryService } from '../category/category.service';
import { ProductService } from '../product/product.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Multi-tenant access control (services)', () => {
  let prisma: {
    category: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    product: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
      updateMany: jest.Mock;
    };
  };
  let categoryService: CategoryService;
  let productService: ProductService;

  beforeEach(() => {
    prisma = {
      category: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      product: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    categoryService = new CategoryService(prisma as unknown as PrismaService);
    productService = new ProductService(prisma as unknown as PrismaService);
  });

  it('denies category access when businessId does not match', async () => {
    prisma.category.findFirst.mockResolvedValue(null);

    await expect(categoryService.findOne('cat-1', 'biz-1')).rejects.toThrow(NotFoundException);
    expect(prisma.category.findFirst).toHaveBeenCalledWith({
      where: { id: 'cat-1', businessId: 'biz-1' },
      include: { _count: { select: { products: true } } },
    });
  });

  it('prevents updating categories across tenants', async () => {
    prisma.category.findFirst.mockResolvedValue(null);

    await expect(categoryService.update('cat-1', 'biz-1', { name: 'Updated' })).rejects.toThrow(
      NotFoundException
    );
    expect(prisma.category.update).not.toHaveBeenCalled();
  });

  it('blocks category reorder when any category is outside tenant scope', async () => {
    prisma.category.findMany.mockResolvedValue([{ id: 'cat-1' }]);

    await expect(
      categoryService.reorder('biz-1', {
        categories: [
          { id: 'cat-1', order: 1 },
          { id: 'cat-2', order: 2 },
        ],
      })
    ).rejects.toThrow(BadRequestException);
  });

  it('denies product access when businessId does not match', async () => {
    prisma.product.findFirst.mockResolvedValue(null);

    await expect(productService.findOne('prod-1', 'biz-1')).rejects.toThrow(NotFoundException);
    expect(prisma.product.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'prod-1',
        category: { businessId: 'biz-1' },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            businessId: true,
          },
        },
        image: {
          select: {
            id: true,
            mimeType: true,
            size: true,
            filename: true,
          },
        },
      },
    });
  });

  it('prevents moving product to category outside tenant', async () => {
    prisma.product.findFirst.mockResolvedValue({ id: 'prod-1', categoryId: 'cat-1' });
    prisma.category.findFirst.mockResolvedValue(null);

    await expect(
      productService.update('prod-1', 'biz-1', { categoryId: 'cat-2' })
    ).rejects.toThrow(BadRequestException);
    expect(prisma.product.update).not.toHaveBeenCalled();
  });

  it('rejects bulk deletes that include products from another tenant', async () => {
    prisma.product.findMany.mockResolvedValue([{ id: 'prod-1' }]);

    await expect(
      productService.bulkDelete('biz-1', { productIds: ['prod-1', 'prod-2'] })
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.product.deleteMany).not.toHaveBeenCalled();
  });
});
