import { IsNotEmpty, IsString, IsOptional, IsObject, IsNumber, Min, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0, { message: 'Price must be non-negative' })
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imageId?: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsOptional()
  @IsObject()
  translations?: Record<string, { name?: string; description?: string }>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
