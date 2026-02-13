import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, JobOptions } from 'bull';
import { EmailOptions } from './email.service';

export interface EmailJobData extends EmailOptions {
  priority?: 'high' | 'normal' | 'low';
  scheduledAt?: Date;
}

const PRIORITY_MAP = { high: 1, normal: 5, low: 10 };

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(@InjectQueue('email') private emailQueue: Queue<EmailJobData>) {}

  async addToQueue(data: EmailJobData): Promise<string> {
    const jobOptions: JobOptions = {
      priority: PRIORITY_MAP[data.priority || 'normal'],
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    };

    if (data.scheduledAt) {
      const delay = new Date(data.scheduledAt).getTime() - Date.now();
      if (delay > 0) jobOptions.delay = delay;
    }

    const job = await this.emailQueue.add('send-email', data, jobOptions);
    this.logger.log(`Email job queued: ${job.id} -> ${data.to}`);
    return job.id.toString();
  }

  async addBulkToQueue(
    recipients: string[],
    baseData: Omit<EmailJobData, 'to'>,
  ): Promise<string[]> {
    const jobs = recipients.map((to) => ({
      name: 'send-email',
      data: { ...baseData, to } as EmailJobData,
      opts: {
        priority: PRIORITY_MAP[baseData.priority || 'low'],
        attempts: 3,
        backoff: { type: 'exponential' as const, delay: 5000 },
        removeOnComplete: 100,
      },
    }));

    const added = await this.emailQueue.addBulk(jobs);
    this.logger.log(`Bulk email jobs queued: ${added.length} emails`);
    return added.map((j) => j.id.toString());
  }

  async getQueueStatus() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.emailQueue.getWaitingCount(),
      this.emailQueue.getActiveCount(),
      this.emailQueue.getCompletedCount(),
      this.emailQueue.getFailedCount(),
      this.emailQueue.getDelayedCount(),
    ]);
    return { waiting, active, completed, failed, delayed };
  }

  async retryFailed(): Promise<number> {
    const failed = await this.emailQueue.getFailed();
    await Promise.all(failed.map((job) => job.retry()));
    this.logger.log(`Retried ${failed.length} failed email jobs`);
    return failed.length;
  }

  async clearCompleted(): Promise<void> {
    await this.emailQueue.clean(24 * 60 * 60 * 1000, 'completed');
    this.logger.log('Cleared completed email jobs older than 24h');
  }
}
