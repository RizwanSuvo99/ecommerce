import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NewsletterService, SubscribeDto, NewsletterSubscription } from './newsletter.service';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  @ApiResponse({ status: 201, description: 'Successfully subscribed' })
  @ApiResponse({ status: 400, description: 'Invalid email address' })
  @ApiResponse({ status: 409, description: 'Email already subscribed' })
  async subscribe(@Body() dto: SubscribeDto): Promise<{ message: string }> {
    await this.newsletterService.subscribe(dto);
    return {
      message: 'Successfully subscribed to the newsletter',
    };
  }

  @Delete('unsubscribe/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsubscribe from newsletter' })
  @ApiResponse({ status: 200, description: 'Successfully unsubscribed' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async unsubscribe(
    @Param('token') token: string,
  ): Promise<{ message: string }> {
    await this.newsletterService.unsubscribe(token);
    return {
      message: 'Successfully unsubscribed from the newsletter',
    };
  }

  @Get('verify/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify newsletter subscription' })
  @ApiResponse({ status: 200, description: 'Subscription verified' })
  @ApiResponse({ status: 404, description: 'Invalid verification token' })
  async verify(@Param('token') token: string): Promise<{ message: string }> {
    await this.newsletterService.verifySubscription(token);
    return {
      message: 'Email address verified successfully',
    };
  }

  @Get('subscribers')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all subscribers (admin)' })
  @ApiResponse({ status: 200, description: 'List of subscribers' })
  async listSubscribers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('status') status?: 'active' | 'unsubscribed' | 'all',
  ): Promise<{
    subscribers: NewsletterSubscription[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.newsletterService.listSubscribers(page, limit, status);
  }
}
