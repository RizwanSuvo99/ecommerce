import { Process, Processor, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService } from './email.service';
import { EmailJobData } from './email-queue.service';

@Processor('email')
export class EmailQueueProcessor {
  private readonly logger = new Logger(EmailQueueProcessor.name);

  constructor(private emailService: EmailService) {}

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, template, context, locale, attachments } = job.data;

    this.logger.log(`Processing email job ${job.id}: ${subject} -> ${to}`);

    await this.emailService.sendEmail({
      to,
      subject,
      template,
      context,
      locale,
      attachments,
    });

    this.logger.log(`Email job ${job.id} completed successfully`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job<EmailJobData>) {
    this.logger.debug(`Email job ${job.id} completed: ${job.data.to}`);
  }

  @OnQueueFailed()
  onFailed(job: Job<EmailJobData>, error: Error) {
    this.logger.error(
      `Email job ${job.id} failed (attempt ${job.attemptsMade}/${job.opts.attempts}): ${error.message}`,
      error.stack,
    );
  }
}
