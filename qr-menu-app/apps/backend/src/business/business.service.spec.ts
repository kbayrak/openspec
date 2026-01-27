import { BusinessService } from './business.service';
import { PrismaService } from '../prisma/prisma.service';
import { QrCodeService } from '../qr-code/qr-code.service';

describe('BusinessService', () => {
  let service: BusinessService;
  const prisma = {
    business: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;
  const qrCodeService = {
    regenerateQrCode: jest.fn(),
  } as unknown as QrCodeService;

  beforeEach(() => {
    service = new BusinessService(prisma, qrCodeService);
  });

  it('generates a slug from business name', () => {
    expect(service.generateSlug('My Coffee Shop!')).toBe('my-coffee-shop');
    expect(service.generateSlug('  Turkish Menu  ')).toBe('turkish-menu');
  });

  it('ensures unique slug by appending suffix', async () => {
    const findUniqueMock = prisma.business.findUnique as unknown as jest.Mock;
    findUniqueMock.mockResolvedValueOnce({ id: 'existing' }).mockResolvedValueOnce(null);

    const slug = await service.ensureUniqueSlug('coffee-shop');
    expect(slug).toBe('coffee-shop-1');
  });
});
