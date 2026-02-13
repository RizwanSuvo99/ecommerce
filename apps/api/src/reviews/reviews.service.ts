import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Submit a review (customer must have purchased the product). */
  async create(userId: string, dto: CreateReviewDto) {
    // Check for duplicate review
    const existing = await this.prisma.review.findFirst({
      where: { userId, productId: dto.productId },
    });

    if (existing) {
      throw new ConflictException('You have already reviewed this product');
    }

    // Verify user has purchased this product (optional strict mode)
    const hasPurchased = await this.prisma.orderItem.findFirst({
      where: {
        productId: dto.productId,
        order: { userId, status: 'DELIVERED' },
      },
    });

    if (!hasPurchased) {
      throw new BadRequestException(
        'You can only review products you have purchased',
      );
    }

    const review = await this.prisma.review.create({
      data: {
        userId,
        productId: dto.productId,
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
        images: dto.images ?? [],
        status: 'PENDING',
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return review;
  }

  /** Get a single review by ID. */
  async findById(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  /** Update a user's own review. */
  async update(
    id: string,
    userId: string,
    data: Partial<Pick<CreateReviewDto, 'rating' | 'title' | 'comment'>>,
  ) {
    const review = await this.findById(id);

    if (review.userId !== userId) {
      throw new BadRequestException('You can only edit your own reviews');
    }

    return this.prisma.review.update({
      where: { id },
      data: { ...data, status: 'PENDING' },
    });
  }

  /** Delete a user's own review. */
  async remove(id: string, userId: string) {
    const review = await this.findById(id);

    if (review.userId !== userId) {
      throw new BadRequestException('You can only delete your own reviews');
    }

    await this.prisma.review.delete({ where: { id } });
    return { deleted: true };
  }
}
