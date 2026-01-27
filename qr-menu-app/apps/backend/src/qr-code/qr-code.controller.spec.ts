import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { QrCodeController } from './qr-code.controller';
import { QrCodeService } from './qr-code.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('QrCodeController', () => {
  let app: INestApplication;
  const qrCodeService = {
    getQrCodeSvg: jest.fn(),
    convertSvgToPng: jest.fn(),
    convertSvgToPdf: jest.fn(),
    updateQrCodeCustomization: jest.fn(),
    regenerateQrCode: jest.fn(),
    validateQrCodeScannability: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [QrCodeController],
      providers: [{ provide: QrCodeService, useValue: qrCodeService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('downloads SVG', async () => {
    qrCodeService.getQrCodeSvg.mockResolvedValueOnce('<svg></svg>');

    await request(app.getHttpServer())
      .get('/qr-code/svg')
      .expect(200)
      .expect('Content-Type', /image\/svg\+xml/);
  });

  it('downloads PNG', async () => {
    qrCodeService.getQrCodeSvg.mockResolvedValueOnce('<svg></svg>');
    qrCodeService.convertSvgToPng.mockResolvedValueOnce(Buffer.from('png'));

    await request(app.getHttpServer())
      .get('/qr-code/png')
      .expect(200)
      .expect('Content-Type', /image\/png/);
  });
});
