import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePageDto, userId: string) {
    const existing = await this.prisma.page.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`A page with slug "${dto.slug}" already exists`);
    }

    return this.prisma.page.create({
      data: {
        ...dto,
        authorId: userId,
      },
    });
  }

  async findAll(query: { search?: string; status?: string; page?: number; limit?: number }) {
    const { search, status, page = 1, limit = 20 } = query;
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { titleBn: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [pages, total] = await Promise.all([
      this.prisma.page.findMany({
        where,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.prisma.page.count({ where }),
    ]);

    return {
      pages: pages.map((p) => ({
        ...p,
        author: p.author
          ? `${p.author.firstName} ${p.author.lastName}`
          : 'Unknown',
      })),
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    return page;
  }

  async findBySlug(slug: string) {
    const page = await this.prisma.page.findFirst({
      where: { slug, status: 'PUBLISHED' },
    });

    if (!page) {
      throw new NotFoundException(`Page not found`);
    }

    return page;
  }

  async update(id: string, dto: UpdatePageDto) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    if (dto.slug && dto.slug !== page.slug) {
      const existing = await this.prisma.page.findUnique({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException(`A page with slug "${dto.slug}" already exists`);
      }
    }

    return this.prisma.page.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    return this.prisma.page.delete({ where: { id } });
  }
}
