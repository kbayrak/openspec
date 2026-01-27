import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { QrCodeService } from '../qr-code/qr-code.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private qrCodeService: QrCodeService,
  ) {}

  /**
   * Generate a slug from business name
   */
  private generateSlug(name: string): string {
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
  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await this.prisma.business.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  private async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string, businessId: string, email: string) {
    const payload = { sub: userId, businessId, email };
    return this.jwtService.sign(payload);
  }

  /**
   * Generate verification token
   */
  private generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Register a new business owner
   */
  async register(registerDto: RegisterDto) {
    const { email, password, businessName } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Generate unique slug
    const baseSlug = this.generateSlug(businessName);
    const slug = await this.ensureUniqueSlug(baseSlug);

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Generate verification token
    const verificationToken = this.generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create business and user in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create business
      const business = await tx.business.create({
        data: {
          name: businessName,
          slug,
          defaultLanguage: 'tr',
        },
      });

      // Create user with Owner role
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: 'OWNER',
          businessId: business.id,
          emailVerified: null,
        },
      });

      // Create verification token
      await tx.verificationToken.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires: verificationExpires,
        },
      });

      return { user, business, verificationToken };
    });

    // Generate QR code for the business
    try {
      await this.qrCodeService.regenerateQrCode(result.business.id);
    } catch (error) {
      // Log error but don't fail registration
      console.error('Failed to generate QR code:', error);
    }

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(email, result.verificationToken);
    } catch (error) {
      // Log error but don't fail registration
      console.error('Failed to send verification email:', error);
    }

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      userId: result.user.id,
      businessId: result.business.id,
      slug: result.business.slug,
    };
  }

  /**
   * Login user and generate JWT token
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with business data
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { business: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    // Generate JWT token
    const accessToken = this.generateToken(user.id, user.businessId, user.email);

    // Create session in database
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await this.prisma.session.create({
      data: {
        userId: user.id,
        sessionToken: accessToken,
        expires: expiresAt,
      },
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        businessName: user.business.name,
        businessSlug: user.business.slug,
      },
    };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string) {
    // Find verification token
    const verificationToken = await this.prisma.verificationToken.findFirst({
      where: {
        token,
        expires: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Update user email verified status
    await this.prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Delete verification token
    await this.prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    });

    return { message: 'Email verified successfully' };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    // Check if user exists (but don't reveal if email doesn't exist)
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      // Generate reset token
      const resetToken = this.generateVerificationToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token
      await this.prisma.verificationToken.create({
        data: {
          identifier: email,
          token: resetToken,
          expires: resetExpires,
        },
      });

      // Send password reset email
      try {
        await this.emailService.sendPasswordResetEmail(email, resetToken);
      } catch (error) {
        // Log error but don't reveal if email exists
        console.error('Failed to send password reset email:', error);
      }
    }

    // Always return success to prevent email enumeration
    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    // Find reset token
    const resetToken = await this.prisma.verificationToken.findFirst({
      where: {
        token,
        expires: { gt: new Date() },
      },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: resetToken.identifier },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const passwordHash = await this.hashPassword(newPassword);

    // Update password and invalidate all sessions
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      this.prisma.session.deleteMany({
        where: { userId: user.id },
      }),
      this.prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: resetToken.identifier,
            token: resetToken.token,
          },
        },
      }),
    ]);

    return { message: 'Password reset successfully' };
  }

  /**
   * Logout user by invalidating session
   */
  async logout(userId: string, token: string) {
    await this.prisma.session.deleteMany({
      where: {
        userId,
        sessionToken: token,
      },
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Validate JWT token and return user
   */
  async validateToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { business: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
      emailVerified: Boolean(user.emailVerified),
    };
  }
}
