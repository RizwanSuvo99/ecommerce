import { Injectable, NotFoundException } from '@nestjs/common';

import { RevalidateService } from '../common/revalidate/revalidate.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Partial update payload from the admin editor. The `name` (unique key)
 * is immutable — it's what the email sender looks up, so a rename would
 * break outbound mail silently.
 */
export interface UpdateEmailTemplateInput {
  subject?: string;
  subjectBn?: string;
  body?: string;
  bodyBn?: string;
  variables?: string[];
  isActive?: boolean;
}

/**
 * CRUD + preview for the EmailTemplate model. The DB model exists and is
 * seeded (welcome / order_confirmation / order_shipped / order_delivered
 * / password_reset / email_verification), but no admin endpoints lived
 * on the API before this module — the admin UI was a static preview
 * pointing at a non-existent /api/admin/email-templates/preview.
 *
 * Preview rendering is deliberately simple mustache-style variable
 * substitution (`{{firstName}}`) — matches what the seed wrote. Heavier
 * layout or partials should move to a proper templater (e.g. MJML + a
 * handlebars step) when the Email module grows.
 */
@Injectable()
export class EmailTemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidate: RevalidateService,
  ) {}

  async findAll() {
    return this.prisma.emailTemplate.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findByName(name: string) {
    const tpl = await this.prisma.emailTemplate.findUnique({ where: { name } });
    if (!tpl) {
      throw new NotFoundException(`Email template "${name}" not found`);
    }
    return tpl;
  }

  async update(name: string, input: UpdateEmailTemplateInput) {
    await this.findByName(name); // 404 if missing

    const updated = await this.prisma.emailTemplate.update({
      where: { name },
      data: input,
    });
    void this.revalidate.revalidate({ tags: ['email-templates'] });
    return updated;
  }

  /**
   * Render a template with a supplied context. Returns the substituted
   * subject/body for both locales so the admin preview can show them
   * side by side.
   */
  async preview(
    name: string,
    context: Record<string, string | number | boolean | null>,
    locale: 'en' | 'bn' = 'en',
  ) {
    const tpl = await this.findByName(name);

    const subjectSource = locale === 'bn' && tpl.subjectBn ? tpl.subjectBn : tpl.subject;
    const bodySource = locale === 'bn' && tpl.bodyBn ? tpl.bodyBn : tpl.body;

    return {
      subject: substitute(subjectSource, context),
      body: substitute(bodySource, context),
      locale,
    };
  }
}

/**
 * Replace `{{key}}` occurrences with context values. Missing keys render
 * as empty strings so a bad context never crashes preview; this matches
 * the seeded templates' assumption that every variable is always present
 * — the Email module is responsible for populating all of them.
 */
function substitute(
  source: string,
  context: Record<string, string | number | boolean | null>,
): string {
  return source.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
    const value = context[key];
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  });
}
