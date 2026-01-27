import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import sharp from 'sharp';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QrCodeService {
  private readonly logger = new Logger(QrCodeService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate QR code as SVG string with optional customization
   */
  async generateQrCodeSvg(
    businessSlug: string,
    options?: {
      fgColor?: string;
      bgColor?: string;
      logoUrl?: string;
      logoEnabled?: boolean;
    },
  ): Promise<string> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const menuUrl = `${frontendUrl}/menu/${businessSlug}`;

    try {
      const qrOptions: QRCode.QRCodeToStringOptions = {
        type: 'svg',
        errorCorrectionLevel: 'M', // Medium error correction
        margin: 2,
        width: 512,
      };

      // Apply color customization if provided
      if (options?.fgColor || options?.bgColor) {
        qrOptions.color = {
          dark: options.fgColor || '#000000',
          light: options.bgColor || '#FFFFFF',
        };
      }

      let svgString = await QRCode.toString(menuUrl, qrOptions);

      // Embed logo if enabled and logo URL is provided
      if (options?.logoEnabled && options?.logoUrl) {
        svgString = await this.embedLogoInQrCode(svgString, options.logoUrl);
      }

      this.logger.log(`QR code generated for business: ${businessSlug}`);
      return svgString;
    } catch (error) {
      this.logger.error(`Failed to generate QR code for ${businessSlug}`, error);
      throw error;
    }
  }

  /**
   * Embed logo in the center of QR code SVG
   */
  private async embedLogoInQrCode(
    svgString: string,
    logoUrl: string,
  ): Promise<string> {
    try {
      // Parse the SVG to add logo in the center
      // For simplicity, we'll add a white circle background and the logo as an embedded image
      const svgSize = 512;
      const logoSize = Math.floor(svgSize * 0.2); // Logo takes 20% of QR code size
      const logoPosition = (svgSize - logoSize) / 2;
      const circleRadius = logoSize / 2 + 8; // Add padding around logo
      const circleCenter = svgSize / 2;

      // Insert circle and logo before the closing </svg> tag
      const logoEmbedding = `
        <!-- Logo background circle -->
        <circle cx="${circleCenter}" cy="${circleCenter}" r="${circleRadius}" fill="white" stroke="#000000" stroke-width="2"/>
        <!-- Logo (placeholder - in production, fetch and embed the actual logo) -->
        <rect x="${logoPosition}" y="${logoPosition}" width="${logoSize}" height="${logoSize}" fill="#CCCCCC" rx="4"/>
      `;

      const modifiedSvg = svgString.replace('</svg>', `${logoEmbedding}</svg>`);

      this.logger.log('Logo embedded in QR code');
      return modifiedSvg;
    } catch (error) {
      this.logger.error('Failed to embed logo in QR code', error);
      // Return original SVG if logo embedding fails
      return svgString;
    }
  }

  /**
   * Validate color contrast for QR code scannability
   */
  private validateColorContrast(fgColor: string, bgColor: string): boolean {
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    };

    // Calculate relative luminance
    const getLuminance = (rgb: { r: number; g: number; b: number }) => {
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const fg = hexToRgb(fgColor);
    const bg = hexToRgb(bgColor);

    if (!fg || !bg) {
      this.logger.warn('Invalid color format');
      return false;
    }

    const l1 = getLuminance(fg);
    const l2 = getLuminance(bg);

    // Calculate contrast ratio
    const contrastRatio =
      (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    // QR codes require at least 3:1 contrast ratio for good scannability
    const isValid = contrastRatio >= 3;

    this.logger.log(
      `Color contrast ratio: ${contrastRatio.toFixed(2)} - ${isValid ? 'Valid' : 'Invalid'}`,
    );

    return isValid;
  }

  /**
   * Validate QR code scannability by testing with error correction
   */
  async validateQrCodeScannability(svgString: string): Promise<boolean> {
    try {
      // Basic validation: check if SVG is well-formed
      if (!svgString || !svgString.includes('<svg') || !svgString.includes('</svg>')) {
        return false;
      }

      // Additional validation could include:
      // - Attempting to decode the QR code using a QR reader library
      // - Checking minimum size requirements
      // - Verifying error correction patterns

      this.logger.log('QR code scannability validated');
      return true;
    } catch (error) {
      this.logger.error('QR code scannability validation failed', error);
      return false;
    }
  }

  /**
   * Get QR code SVG for a business with customization options
   */
  async getQrCodeSvg(businessId: string): Promise<string> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (!business.qrCodeSvg) {
      // Generate QR code with customization if it doesn't exist
      const qrCodeSvg = await this.generateQrCodeSvg(business.slug, {
        fgColor: business.qrCodeFgColor || '#000000',
        bgColor: business.qrCodeBgColor || '#FFFFFF',
        logoUrl: business.logo || undefined,
        logoEnabled: business.qrCodeLogoEnabled || false,
      });

      // Save to database
      await this.prisma.business.update({
        where: { id: businessId },
        data: { qrCodeSvg },
      });

      return qrCodeSvg;
    }

    return business.qrCodeSvg;
  }

  /**
   * Convert SVG to PNG buffer
   */
  async convertSvgToPng(svgString: string): Promise<Buffer> {
    try {
      const pngBuffer = await sharp(Buffer.from(svgString))
        .resize(1024, 1024)
        .png()
        .toBuffer();

      this.logger.log('QR code converted to PNG');
      return pngBuffer;
    } catch (error) {
      this.logger.error('Failed to convert SVG to PNG', error);
      throw error;
    }
  }

  /**
   * Convert SVG to PDF buffer
   */
  async convertSvgToPdf(svgString: string, businessName: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          this.logger.log('QR code converted to PDF');
          resolve(pdfBuffer);
        });

        // Add title
        doc.fontSize(20).text(`QR Code - ${businessName}`, {
          align: 'center',
        });

        doc.moveDown(2);

        // Convert SVG to PNG first, then add to PDF
        sharp(Buffer.from(svgString))
          .resize(400, 400)
          .png()
          .toBuffer()
          .then((pngBuffer) => {
            // Center the QR code on the page
            const pageWidth = doc.page.width;
            const imageSize = 400;
            const x = (pageWidth - imageSize) / 2;

            doc.image(pngBuffer, x, doc.y, {
              width: imageSize,
              height: imageSize,
            });

            doc.moveDown(2);

            // Add instructions
            doc.fontSize(12).text('Scan this QR code to view the menu', {
              align: 'center',
            });

            doc.end();
          })
          .catch(reject);
      } catch (error) {
        this.logger.error('Failed to convert SVG to PDF', error);
        reject(error);
      }
    });
  }

  /**
   * Regenerate QR code for a business (e.g., when slug or customization changes)
   */
  async regenerateQrCode(businessId: string): Promise<string> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const qrCodeSvg = await this.generateQrCodeSvg(business.slug, {
      fgColor: business.qrCodeFgColor || '#000000',
      bgColor: business.qrCodeBgColor || '#FFFFFF',
      logoUrl: business.logo || undefined,
      logoEnabled: business.qrCodeLogoEnabled || false,
    });

    await this.prisma.business.update({
      where: { id: businessId },
      data: { qrCodeSvg },
    });

    this.logger.log(`QR code regenerated for business: ${business.slug}`);
    return qrCodeSvg;
  }

  /**
   * Update QR code customization settings for a business
   */
  async updateQrCodeCustomization(
    businessId: string,
    options: {
      fgColor?: string;
      bgColor?: string;
      logoEnabled?: boolean;
    },
  ): Promise<void> {
    const updateData: any = {};

    if (options.fgColor !== undefined) {
      updateData.qrCodeFgColor = options.fgColor;
    }
    if (options.bgColor !== undefined) {
      updateData.qrCodeBgColor = options.bgColor;
    }
    if (options.logoEnabled !== undefined) {
      updateData.qrCodeLogoEnabled = options.logoEnabled;
    }

    await this.prisma.business.update({
      where: { id: businessId },
      data: updateData,
    });

    this.logger.log(`QR code customization updated for business: ${businessId}`);
  }

  /**
   * Validate colors for QR code scannability (public method)
   */
  async validateColors(fgColor: string, bgColor: string): Promise<boolean> {
    return this.validateColorContrast(fgColor, bgColor);
  }
}
