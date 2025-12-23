import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBannerDto) {
    const maxSortOrder = await this.prisma.banner.aggregate({
      _max: { sortOrder: true },
    });
    const sortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

    const { imageMobile, startDate, endDate, subtitle, subtitleBn, buttonText, buttonTextBn, backgroundColor, textColor, ...rest } = dto;

    return this.prisma.banner.create({
      data: {
        ...rest,
        mobileImage: imageMobile ?? null,
        startsAt: startDate ? new Date(startDate) : null,
        endsAt: endDate ? new Date(endDate) : null,
        sortOrder,
      },
    });
  }

  async findAll() {
    const banners = await this.prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return { banners };
  }

  async findActive() {
    const now = new Date();

    const banners = await this.prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startsAt: null, endsAt: null },
          { startsAt: { lte: now }, endsAt: null },
          { startsAt: null, endsAt: { gte: now } },
          { startsAt: { lte: now }, endsAt: { gte: now } },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });

    return { banners };
  }

  async findOne(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    return banner;
  }

  async update(id: string, dto: UpdateBannerDto) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }

    const { imageMobile, startDate, endDate, subtitle, subtitleBn, buttonText, buttonTextBn, backgroundColor, textColor, ...rest } = dto;
    const data: Record<string, unknown> = { ...rest };
    if (imageMobile !== undefined) data.mobileImage = imageMobile;
    if (startDate) data.startsAt = new Date(startDate);
    if (endDate) data.endsAt = new Date(endDate);

    return this.prisma.banner.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    return this.prisma.banner.delete({ where: { id } });
  }

  async reorder(positions: { id: string; sortOrder: number }[]) {
    const updates = positions.map((item) =>
      this.prisma.banner.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    );

    await this.prisma.$transaction(updates);
    return { success: true };
  }
}
