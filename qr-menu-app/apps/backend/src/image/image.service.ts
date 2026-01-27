import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ImageService {
  constructor(private prisma: PrismaService) {}

  // Allowed image formats
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  // Max file size: 5MB
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024;

  /**
   * Upload an image to PostgreSQL blob storage
   */
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ id: string; url: string }> {
    // Validate file
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate mime type
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum size is ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`,
      );
    }

    // Store in database
    const image = await this.prisma.image.create({
      data: {
        data: Uint8Array.from(file.buffer),
        mimeType: file.mimetype,
        size: file.size,
        filename: file.originalname,
      },
    });

    return {
      id: image.id,
      url: `/images/${image.id}`,
    };
  }

  /**
   * Get image by ID
   */
  async getImage(id: string): Promise<{
    data: Buffer;
    mimeType: string;
    filename: string;
  }> {
    const image = await this.prisma.image.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return {
      data: Buffer.from(image.data),
      mimeType: image.mimeType,
      filename: image.filename,
    };
  }

  /**
   * Delete an image
   */
  async deleteImage(id: string): Promise<void> {
    const image = await this.prisma.image.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.prisma.image.delete({
      where: { id },
    });
  }

  /**
   * Get image metadata
   */
  async getImageMetadata(id: string) {
    const image = await this.prisma.image.findUnique({
      where: { id },
      select: {
        id: true,
        mimeType: true,
        size: true,
        filename: true,
        createdAt: true,
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return image;
  }
}
