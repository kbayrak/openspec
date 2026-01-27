import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new category
   */
  async create(businessId: string, createDto: CreateCategoryDto) {
    // Check for duplicate category name in this business
    const existing = await this.prisma.category.findFirst({
      where: {
        businessId,
        name: createDto.name,
      },
    });

    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }

    // Get the next order number
    const maxOrder = await this.prisma.category.aggregate({
      where: { businessId },
      _max: { order: true },
    });

    const order = createDto.order ?? (maxOrder._max.order ?? 0) + 1;

    return this.prisma.category.create({
      data: {
        name: createDto.name,
        businessId,
        order,
        translations: createDto.translations || {},
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  /**
   * Get all categories for a business (public endpoint)
   */
  async findAll(businessId: string) {
    return this.prisma.category.findMany({
      where: { businessId },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  /**
   * Get all categories with products (for admin)
   */
  async findAllWithProducts(businessId: string) {
    return this.prisma.category.findMany({
      where: { businessId },
      orderBy: { order: 'asc' },
      include: {
        products: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { products: true },
        },
      },
    });
  }

  /**
   * Get a single category by ID
   */
  async findOne(id: string, businessId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, businessId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  /**
   * Update a category
   */
  async update(id: string, businessId: string, updateDto: UpdateCategoryDto) {
    // Check if category exists and belongs to business
    const category = await this.prisma.category.findFirst({
      where: { id, businessId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check for duplicate name if updating name
    if (updateDto.name && updateDto.name !== category.name) {
      const existing = await this.prisma.category.findFirst({
        where: {
          businessId,
          name: updateDto.name,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(updateDto.name && { name: updateDto.name }),
        ...(updateDto.order !== undefined && { order: updateDto.order }),
        ...(updateDto.translations && { translations: updateDto.translations }),
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  /**
   * Delete a category
   */
  async remove(id: string, businessId: string) {
    // Check if category exists and belongs to business
    const category = await this.prisma.category.findFirst({
      where: { id, businessId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Warn if category has products (handled by frontend confirmation)
    if (category._count.products > 0) {
      // The cascade delete will remove associated products
      // This is intentional as per the requirements
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return {
      message: 'Category deleted successfully',
      productsDeleted: category._count.products,
    };
  }

  /**
   * Reorder categories
   */
  async reorder(businessId: string, reorderDto: ReorderCategoriesDto) {
    // Verify all categories belong to this business
    const categoryIds = reorderDto.categories.map((c) => c.id);
    const categories = await this.prisma.category.findMany({
      where: {
        id: { in: categoryIds },
        businessId,
      },
    });

    if (categories.length !== categoryIds.length) {
      throw new BadRequestException('One or more categories not found or do not belong to this business');
    }

    // Update order for each category
    await Promise.all(
      reorderDto.categories.map((item) =>
        this.prisma.category.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    return { message: 'Categories reordered successfully' };
  }

  /**
   * Update category translations
   */
  async updateTranslations(
    id: string,
    businessId: string,
    translations: Record<string, string>
  ) {
    // Check if category exists and belongs to business
    const category = await this.prisma.category.findFirst({
      where: { id, businessId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.category.update({
      where: { id },
      data: { translations },
    });
  }
}
