import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { ProductService } from '../product/product.service';

@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly productService: ProductService,
  ) {}

  /**
   * Create a new category (protected)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(req.user.businessId, createCategoryDto);
  }

  /**
   * Get all categories (public - requires businessId query param)
   */
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Query('businessId') businessId?: string, @Request() req?) {
    // If authenticated, use user's businessId
    // Otherwise, require businessId query param (for public menu view)
    const targetBusinessId = req?.user?.businessId || businessId;

    if (!targetBusinessId) {
      return { message: 'businessId query parameter is required for public access' };
    }

    return this.categoryService.findAll(targetBusinessId);
  }

  /**
   * Get all categories with products (protected, for admin)
   */
  @Get('with-products')
  @UseGuards(JwtAuthGuard)
  findAllWithProducts(@Request() req) {
    return this.categoryService.findAllWithProducts(req.user.businessId);
  }

  /**
   * Get a single category (protected)
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    return this.categoryService.findOne(id, req.user.businessId);
  }

  /**
   * Get all products in a category (public)
   */
  @Get(':id/products')
  @UseGuards(OptionalJwtAuthGuard)
  findProductsByCategory(
    @Param('id') id: string,
    @Query('businessId') businessId?: string,
    @Request() req?,
  ) {
    const targetBusinessId = req?.user?.businessId || businessId;
    return this.productService.findByCategory(id, targetBusinessId);
  }

  /**
   * Update a category (protected)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req,
  ) {
    return this.categoryService.update(id, req.user.businessId, updateCategoryDto);
  }

  /**
   * Delete a category (protected)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.categoryService.remove(id, req.user.businessId);
  }

  /**
   * Reorder categories (protected)
   */
  @Patch('reorder/bulk')
  @UseGuards(JwtAuthGuard)
  reorder(@Body() reorderDto: ReorderCategoriesDto, @Request() req) {
    return this.categoryService.reorder(req.user.businessId, reorderDto);
  }

  /**
   * Update category translations (protected)
   */
  @Patch(':id/translations')
  @UseGuards(JwtAuthGuard)
  updateTranslations(
    @Param('id') id: string,
    @Body() body: { translations: Record<string, string> },
    @Request() req,
  ) {
    return this.categoryService.updateTranslations(
      id,
      req.user.businessId,
      body.translations,
    );
  }
}
