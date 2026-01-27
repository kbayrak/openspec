import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  /**
   * Get business by slug (public endpoint)
   */
  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.businessService.getBySlug(slug);
  }

  /**
   * Get current user's business (protected endpoint)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getCurrent(@Request() req) {
    return this.businessService.getById(req.user.businessId);
  }

  /**
   * Update business information (protected endpoint)
   */
  @Patch()
  @UseGuards(JwtAuthGuard)
  async update(@Request() req, @Body() updateDto: UpdateBusinessDto) {
    return this.businessService.update(req.user.businessId, updateDto);
  }
}
