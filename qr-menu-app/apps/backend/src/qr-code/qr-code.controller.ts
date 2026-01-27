import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QrCodeService } from './qr-code.service';

@Controller('qr-code')
@UseGuards(JwtAuthGuard)
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  /**
   * Download QR code as SVG
   */
  @Get('svg')
  async downloadSvg(@Request() req, @Res() res: Response) {
    const businessId = req.user.businessId;
    const svgString = await this.qrCodeService.getQrCodeSvg(businessId);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', 'attachment; filename="qr-code.svg"');
    res.status(HttpStatus.OK).send(svgString);
  }

  /**
   * Download QR code as PNG
   */
  @Get('png')
  async downloadPng(@Request() req, @Res() res: Response) {
    const businessId = req.user.businessId;
    const svgString = await this.qrCodeService.getQrCodeSvg(businessId);
    const pngBuffer = await this.qrCodeService.convertSvgToPng(svgString);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="qr-code.png"');
    res.status(HttpStatus.OK).send(pngBuffer);
  }

  /**
   * Download QR code as PDF
   */
  @Get('pdf')
  async downloadPdf(@Request() req, @Res() res: Response) {
    const businessId = req.user.businessId;
    const businessName = req.user.businessName || 'Your Business';

    const svgString = await this.qrCodeService.getQrCodeSvg(businessId);
    const pdfBuffer = await this.qrCodeService.convertSvgToPdf(
      svgString,
      businessName,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="qr-code.pdf"');
    res.status(HttpStatus.OK).send(pdfBuffer);
  }

  /**
   * Get QR code preview (SVG as JSON response)
   */
  @Get('preview')
  async getPreview(@Request() req) {
    const businessId = req.user.businessId;
    const svgString = await this.qrCodeService.getQrCodeSvg(businessId);

    return {
      svg: svgString,
      businessId,
    };
  }

  /**
   * Update QR code customization and regenerate
   */
  @Post('customize')
  async customizeQrCode(
    @Request() req,
    @Body()
    body: {
      fgColor?: string;
      bgColor?: string;
      logoEnabled?: boolean;
    },
  ) {
    const businessId = req.user.businessId;

    // Validate color format (hex colors)
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (body.fgColor && !hexColorRegex.test(body.fgColor)) {
      throw new BadRequestException('Invalid foreground color format. Use hex format (e.g., #000000)');
    }
    if (body.bgColor && !hexColorRegex.test(body.bgColor)) {
      throw new BadRequestException('Invalid background color format. Use hex format (e.g., #FFFFFF)');
    }

    // Update business customization settings
    await this.qrCodeService.updateQrCodeCustomization(businessId, {
      fgColor: body.fgColor,
      bgColor: body.bgColor,
      logoEnabled: body.logoEnabled,
    });

    // Regenerate QR code with new settings
    const qrCodeSvg = await this.qrCodeService.regenerateQrCode(businessId);

    // Validate scannability
    const isScannable = await this.qrCodeService.validateQrCodeScannability(qrCodeSvg);

    return {
      success: true,
      svg: qrCodeSvg,
      scannability: {
        valid: isScannable,
        message: isScannable
          ? 'QR code is scannable'
          : 'Warning: QR code may have reduced scannability',
      },
    };
  }

  /**
   * Validate color contrast for QR code
   */
  @Post('validate-colors')
  async validateColors(
    @Body() body: { fgColor: string; bgColor: string },
  ) {
    // Validate color format
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexColorRegex.test(body.fgColor) || !hexColorRegex.test(body.bgColor)) {
      throw new BadRequestException('Invalid color format. Use hex format (e.g., #000000)');
    }

    const isValid = await this.qrCodeService.validateColors(
      body.fgColor,
      body.bgColor,
    );

    return {
      valid: isValid,
      message: isValid
        ? 'Colors have sufficient contrast for QR code scannability'
        : 'Colors do not have sufficient contrast. QR code may not scan properly.',
    };
  }
}
