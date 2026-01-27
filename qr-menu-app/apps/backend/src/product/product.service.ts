import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BulkDeleteProductsDto } from './dto/bulk-delete-products.dto';
import { BulkStatusChangeDto } from './dto/bulk-status-change.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new product
   */
  async create(businessId: string, createDto: CreateProductDto) {
    // Verify that the category exists and belongs to this business
    const category = await this.prisma.category.findFirst({
      where: {
        id: createDto.categoryId,
        businessId,
      },
    });

    if (!category) {
      throw new BadRequestException('Category not found or does not belong to your business');
    }

    return this.prisma.product.create({
      data: {
        name: createDto.name,
        description: createDto.description,
        price: createDto.price,
        imageUrl: createDto.imageUrl,
        imageId: createDto.imageId,
        categoryId: createDto.categoryId,
        translations: createDto.translations || {},
        isActive: createDto.isActive ?? true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        image: true,
      },
    });
  }

  /**
   * Get all products for a business (public endpoint with optional businessId)
   */
  async findAll(businessId?: string) {
    if (!businessId) {
      throw new BadRequestException('businessId is required');
    }

    return this.prisma.product.findMany({
      where: {
        category: {
          businessId,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
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
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get products by category ID
   */
  async findByCategory(categoryId: string, businessId?: string) {
    // If businessId provided (authenticated request), verify ownership
    if (businessId) {
      const category = await this.prisma.category.findFirst({
        where: { id: categoryId, businessId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    return this.prisma.product.findMany({
      where: { categoryId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
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
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single product by ID
   */
  async findOne(id: string, businessId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        category: {
          businessId,
        },
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

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  /**
   * Update a product
   */
  async update(id: string, businessId: string, updateDto: UpdateProductDto) {
    // Check if product exists and belongs to business
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        category: {
          businessId,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // If updating categoryId, verify the new category belongs to this business
    if (updateDto.categoryId && updateDto.categoryId !== product.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: updateDto.categoryId,
          businessId,
        },
      });

      if (!category) {
        throw new BadRequestException('Category not found or does not belong to your business');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(updateDto.name && { name: updateDto.name }),
        ...(updateDto.description !== undefined && { description: updateDto.description }),
        ...(updateDto.price !== undefined && { price: updateDto.price }),
        ...(updateDto.imageUrl !== undefined && { imageUrl: updateDto.imageUrl }),
        ...(updateDto.imageId !== undefined && { imageId: updateDto.imageId }),
        ...(updateDto.categoryId && { categoryId: updateDto.categoryId }),
        ...(updateDto.translations && { translations: updateDto.translations }),
        ...(updateDto.isActive !== undefined && { isActive: updateDto.isActive }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
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
  }

  /**
   * Delete a product
   */
  async remove(id: string, businessId: string) {
    // Check if product exists and belongs to business
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        category: {
          businessId,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Product deleted successfully' };
  }

  /**
   * Bulk delete products
   */
  async bulkDelete(businessId: string, bulkDeleteDto: BulkDeleteProductsDto) {
    // Verify all products belong to this business
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: bulkDeleteDto.productIds },
        category: {
          businessId,
        },
      },
    });

    if (products.length !== bulkDeleteDto.productIds.length) {
      throw new ForbiddenException('One or more products not found or do not belong to your business');
    }

    const result = await this.prisma.product.deleteMany({
      where: {
        id: { in: bulkDeleteDto.productIds },
      },
    });

    return {
      message: 'Products deleted successfully',
      count: result.count,
    };
  }

  /**
   * Bulk status change (activate/deactivate)
   */
  async bulkStatusChange(businessId: string, bulkStatusDto: BulkStatusChangeDto) {
    // Verify all products belong to this business
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: bulkStatusDto.productIds },
        category: {
          businessId,
        },
      },
    });

    if (products.length !== bulkStatusDto.productIds.length) {
      throw new ForbiddenException('One or more products not found or do not belong to your business');
    }

    const result = await this.prisma.product.updateMany({
      where: {
        id: { in: bulkStatusDto.productIds },
      },
      data: {
        isActive: bulkStatusDto.isActive,
      },
    });

    return {
      message: `Products ${bulkStatusDto.isActive ? 'activated' : 'deactivated'} successfully`,
      count: result.count,
    };
  }

  /**
   * Update product translations
   */
  async updateTranslations(
    id: string,
    businessId: string,
    translations: Record<string, { name?: string; description?: string }>
  ) {
    // Check if product exists and belongs to business
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        category: {
          businessId,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: { translations },
      include: {
        category: {
          select: {
            id: true,
            name: true,
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
  }
}
