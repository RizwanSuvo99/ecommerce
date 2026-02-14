import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface SubscribeDto {
  email: string;
  name?: string;
  source?: string;
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  name?: string;
  status: 'pending' | 'active' | 'unsubscribed';
  verificationToken: string;
  unsubscribeToken: string;
  source?: string;
  subscribedAt: Date;
  verifiedAt?: Date;
  unsubscribedAt?: Date;
}

@Injectable()
export class NewsletterService {
  // In-memory store (replace with Prisma in production)
  private subscriptions: Map<string, NewsletterSubscription> = new Map();

  /**
   * Subscribe an email to the newsletter
   */
  async subscribe(dto: SubscribeDto): Promise<NewsletterSubscription> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      throw new BadRequestException('Invalid email address');
    }

    const normalizedEmail = dto.email.toLowerCase().trim();

    // Check for existing subscription
    const existing = this.findByEmail(normalizedEmail);
    if (existing) {
      if (existing.status === 'active') {
        throw new ConflictException('Email is already subscribed');
      }
      // Re-subscribe if previously unsubscribed
      if (existing.status === 'unsubscribed') {
        existing.status = 'pending';
        existing.verificationToken = randomUUID();
        existing.unsubscribedAt = undefined;
        this.subscriptions.set(existing.id, existing);
        await this.sendVerificationEmail(existing);
        return existing;
      }
    }

    // Create new subscription
    const subscription: NewsletterSubscription = {
      id: randomUUID(),
      email: normalizedEmail,
      name: dto.name,
      status: 'pending',
      verificationToken: randomUUID(),
      unsubscribeToken: randomUUID(),
      source: dto.source || 'website',
      subscribedAt: new Date(),
    };

    this.subscriptions.set(subscription.id, subscription);

    // Send verification email
    await this.sendVerificationEmail(subscription);

    return subscription;
  }

  /**
   * Verify a subscription by token
   */
  async verifySubscription(token: string): Promise<NewsletterSubscription> {
    const subscription = Array.from(this.subscriptions.values()).find(
      (sub) => sub.verificationToken === token,
    );

    if (!subscription) {
      throw new NotFoundException('Invalid verification token');
    }

    subscription.status = 'active';
    subscription.verifiedAt = new Date();
    this.subscriptions.set(subscription.id, subscription);

    // Send welcome email
    await this.sendWelcomeEmail(subscription);

    return subscription;
  }

  /**
   * Unsubscribe by token
   */
  async unsubscribe(token: string): Promise<void> {
    const subscription = Array.from(this.subscriptions.values()).find(
      (sub) => sub.unsubscribeToken === token,
    );

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.status = 'unsubscribed';
    subscription.unsubscribedAt = new Date();
    this.subscriptions.set(subscription.id, subscription);
  }

  /**
   * List all subscribers (for admin)
   */
  async listSubscribers(
    page: number = 1,
    limit: number = 50,
    status?: 'active' | 'unsubscribed' | 'all',
  ): Promise<{
    subscribers: NewsletterSubscription[];
    total: number;
    page: number;
    limit: number;
  }> {
    let subscribers = Array.from(this.subscriptions.values());

    if (status && status !== 'all') {
      subscribers = subscribers.filter((sub) => sub.status === status);
    }

    const total = subscribers.length;
    const offset = (page - 1) * limit;
    const paginated = subscribers
      .sort((a, b) => b.subscribedAt.getTime() - a.subscribedAt.getTime())
      .slice(offset, offset + limit);

    return {
      subscribers: paginated,
      total,
      page,
      limit,
    };
  }

  /**
   * Get subscriber count
   */
  async getActiveCount(): Promise<number> {
    return Array.from(this.subscriptions.values()).filter(
      (sub) => sub.status === 'active',
    ).length;
  }

  /**
   * Find subscription by email
   */
  private findByEmail(email: string): NewsletterSubscription | undefined {
    return Array.from(this.subscriptions.values()).find(
      (sub) => sub.email === email,
    );
  }

  /**
   * Send verification email (placeholder)
   */
  private async sendVerificationEmail(
    subscription: NewsletterSubscription,
  ): Promise<void> {
    // In production, use the EmailService to send verification email
    // const verifyUrl = `${process.env.SITE_URL}/newsletter/verify/${subscription.verificationToken}`;
    console.log(
      `[Newsletter] Verification email would be sent to: ${subscription.email}`,
    );
  }

  /**
   * Send welcome email (placeholder)
   */
  private async sendWelcomeEmail(
    subscription: NewsletterSubscription,
  ): Promise<void> {
    // In production, use the EmailService to send welcome email
    console.log(
      `[Newsletter] Welcome email would be sent to: ${subscription.email}`,
    );
  }
}
