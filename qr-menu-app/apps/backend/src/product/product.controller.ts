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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BulkDeleteProductsDto } from './dto/bulk-delete-products.dto';
import { BulkStatusChangeDto } from './dto/bulk-status-change.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Create a new product (protected)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createProductDto: CreateProductDto) {
    return this.productService.create(req.user.businessId, createProductDto);
  }

  /**
   * Get all products (public - requires businessId query param, or protected)
   */
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Query('businessId') businessId?: string, @Request() req?) {
    // If authenticated, use user's businessId
    // Otherwise, require businessId query param (for public menu view)
    const targetBusinessId = req?.user?.businessId || businessId;

    return this.productService.findAll(targetBusinessId);
  }

  /**
   * Get a single product (protected)
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    return this.productService.findOne(id, req.user.businessId);
  }

  /**
   * Update a product (protected)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req,
  ) {
    return this.productService.update(id, req.user.businessId, updateProductDto);
  }

  /**
   * Delete a product (protected)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.productService.remove(id, req.user.businessId);
  }

  /**
   * Bulk delete products (protected)
   */
  @Delete('bulk/delete')
  @UseGuards(JwtAuthGuard)
  bulkDelete(@Body() bulkDeleteDto: BulkDeleteProductsDto, @Request() req) {
    return this.productService.bulkDelete(req.user.businessId, bulkDeleteDto);
  }

  /**
   * Bulk status change (protected)
   */
  @Patch('bulk/status')
  @UseGuards(JwtAuthGuard)
  bulkStatusChange(@Body() bulkStatusDto: BulkStatusChangeDto, @Request() req) {
    return this.productService.bulkStatusChange(req.user.businessId, bulkStatusDto);
  }

  /**
   * Update product translations (protected)
   */
  @Patch(':id/translations')
  @UseGuards(JwtAuthGuard)
  updateTranslations(
    @Param('id') id: string,
    @Body() body: { translations: Record<string, { name?: string; description?: string }> },
    @Request() req,
  ) {
    return this.productService.updateTranslations(
      id,
      req.user.businessId,
      body.translations,
    );
  }
}
