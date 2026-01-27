import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Response,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response as ExpressResponse } from 'express';
import { ImageService } from './image.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  /**
   * Upload an image (protected)
   */
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.imageService.uploadImage(file);
  }

  /**
   * Get an image by ID (public)
   */
  @Get(':id')
  async getImage(
    @Param('id') id: string,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const image = await this.imageService.getImage(id);

    // Set response headers
    res.set({
      'Content-Type': image.mimeType,
      'Content-Disposition': `inline; filename="${image.filename}"`,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    });

    return new StreamableFile(Buffer.from(image.data));
  }

  /**
   * Get image metadata (public)
   */
  @Get(':id/metadata')
  async getImageMetadata(@Param('id') id: string) {
    return this.imageService.getImageMetadata(id);
  }

  /**
   * Delete an image (protected)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteImage(@Param('id') id: string) {
    await this.imageService.deleteImage(id);
    return { message: 'Image deleted successfully' };
  }
}
