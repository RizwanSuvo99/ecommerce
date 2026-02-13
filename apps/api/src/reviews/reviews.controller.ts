import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /** POST /reviews — submit a new review */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() dto: CreateReviewDto) {
    return { data: await this.reviewsService.create(req.user.id, dto) };
  }

  /** GET /reviews/:id — get a review */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { data: await this.reviewsService.findById(id) };
  }

  /** PATCH /reviews/:id — update own review */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: Partial<CreateReviewDto>,
  ) {
    return { data: await this.reviewsService.update(id, req.user.id, body) };
  }

  /** DELETE /reviews/:id — delete own review */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Req() req: any) {
    return { data: await this.reviewsService.remove(id, req.user.id) };
  }
}
