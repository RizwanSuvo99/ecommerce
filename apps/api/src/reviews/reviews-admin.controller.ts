import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  AdminReviewQueryDto,
  AdminReviewResponseDto,
  ModerateReviewDto,
} from './dto/moderate-review.dto';
import { ReviewsAdminService } from './reviews-admin.service';

@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsAdminController {
  constructor(private readonly adminService: ReviewsAdminService) {}

  /** GET /admin/reviews — list all reviews (with moderation status) */
  @Get()
  async findAll(@Query() query: AdminReviewQueryDto) {
    return { data: await this.adminService.findAll(query) };
  }

  /** PATCH /admin/reviews/:id/moderate — approve or reject */
  @Patch(':id/moderate')
  async moderate(@Param('id') id: string, @Body() dto: ModerateReviewDto) {
    return { data: await this.adminService.moderate(id, dto) };
  }

  /** POST /admin/reviews/:id/respond — admin response to review */
  @Post(':id/respond')
  async respond(@Param('id') id: string, @Body() dto: AdminReviewResponseDto) {
    return { data: await this.adminService.respond(id, dto.response) };
  }

  /** DELETE /admin/reviews/:id — permanently delete */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return { data: await this.adminService.remove(id) };
  }
}
