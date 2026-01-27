import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QrCodeService } from '../qr-code/qr-code.service';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(
    private prisma: PrismaService,
    private qrCodeService: QrCodeService,
  ) {}

  /**
   * Get business by slug (public endpoint)
   */
  async getBySlug(slug: string) {
    const business = await this.prisma.business.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        defaultLanguage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  /**
   * Get business by ID (for authenticated users)
   */
  async getById(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        qrCodeSvg: true,
        defaultLanguage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  /**
   * Update business information
   */
  async update(businessId: string, updateDto: UpdateBusinessDto) {
    const { slug, ...data } = updateDto;

    // Check if business exists
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // If slug is being updated, check for uniqueness
    if (slug && slug !== business.slug) {
      const existingBusiness = await this.prisma.business.findUnique({
        where: { slug },
      });

      if (existingBusiness) {
        throw new ConflictException('Slug already in use');
      }
    }

    // Update business
    const updated = await this.prisma.business.update({
      where: { id: businessId },
      data: {
        ...data,
        ...(slug && { slug }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        qrCodeSvg: true,
        defaultLanguage: true,
        updatedAt: true,
      },
    });

    // Regenerate QR code if slug was changed
    if (slug && slug !== business.slug) {
      await this.qrCodeService.regenerateQrCode(businessId);
    }

    return updated;
  }

  /**
   * Generate a slug from business name
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .substring(0, 50); // Max 50 chars
  }

  /**
   * Ensure slug uniqueness by adding numeric suffix if needed
   */
  async ensureUniqueSlug(baseSlug: string, excludeBusinessId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.business.findUnique({
        where: { slug },
      });

      if (!existing || existing.id === excludeBusinessId) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}
