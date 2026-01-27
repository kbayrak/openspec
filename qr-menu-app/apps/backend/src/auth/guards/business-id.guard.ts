import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard to enforce multi-tenant data isolation
 * Ensures that users can only access resources from their own business
 */
@Injectable()
export class BusinessIdGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.businessId) {
      throw new ForbiddenException('User business ID not found');
    }

    // Attach businessId to request for use in controllers/services
    request.businessId = user.businessId;

    return true;
  }
}
