import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { EmailTemplatesService, type UpdateEmailTemplateInput } from './email-templates.service';
import { AdminGuard } from '../admin/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Admin CRUD for the transactional email templates seeded in the DB.
 * The Email module at runtime reads these rows to render outbound mail,
 * so edits take effect on the very next sent email — no cold start
 * required.
 */
@Controller('admin/email-templates')
@UseGuards(JwtAuthGuard, AdminGuard)
export class EmailTemplatesController {
  constructor(private readonly templates: EmailTemplatesService) {}

  @Get()
  async list() {
    return { data: await this.templates.findAll() };
  }

  @Get(':name')
  async get(@Param('name') name: string) {
    return { data: await this.templates.findByName(name) };
  }

  @Patch(':name')
  async update(@Param('name') name: string, @Body() input: UpdateEmailTemplateInput) {
    return { data: await this.templates.update(name, input) };
  }

  /**
   * Render the template with a supplied context. Accepts `{ context,
   * locale }` in the body; the admin UI sends a SAMPLE_DATA dict it
   * already maintains, keyed by template name.
   */
  @Post(':name/preview')
  async preview(
    @Param('name') name: string,
    @Body()
    body: {
      context?: Record<string, string | number | boolean | null>;
      locale?: 'en' | 'bn';
    },
  ) {
    return {
      data: await this.templates.preview(name, body.context ?? {}, body.locale ?? 'en'),
    };
  }
}
