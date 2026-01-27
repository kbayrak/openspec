import { QrCodeService } from './qr-code.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('QrCodeService', () => {
  let service: QrCodeService;

  const prisma = {
    business: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;

  const configService = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  } as unknown as ConfigService;

  beforeEach(() => {
    service = new QrCodeService(prisma, configService);
  });

  it('validates QR code scannability for valid SVG', async () => {
    const result = await service.validateQrCodeScannability('<svg></svg>');
    expect(result).toBe(true);
  });

  it('rejects invalid SVG for scannability', async () => {
    const result = await service.validateQrCodeScannability('not-svg');
    expect(result).toBe(false);
  });

  it('validates color contrast correctly', async () => {
    const valid = await service.validateColors('#000000', '#ffffff');
    const invalid = await service.validateColors('#777777', '#888888');
    expect(valid).toBe(true);
    expect(invalid).toBe(false);
  });
});
