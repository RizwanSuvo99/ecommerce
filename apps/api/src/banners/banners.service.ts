import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBannerDto) {
    const maxPosition = await this.prisma.banner.aggregate({
      _max: { position: true },
    });
    const position = (maxPosition._max.position ?? -1) + 1;

    return this.prisma.banner.create({
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        position,
      },
    });
  }

  async findAll() {
    const banners = await this.prisma.banner.findMany({
      orderBy: { position: 'asc' },
    });

    return { banners };
  }

  async findActive() {
    const now = new Date();

    const banners = await this.prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      orderBy: { position: 'asc' },
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

    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);

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

  async reorder(positions: { id: string; position: number }[]) {
    const updates = positions.map((item) =>
      this.prisma.banner.update({
        where: { id: item.id },
        data: { position: item.position },
      }),
    );

    await this.prisma.$transaction(updates);
    return { success: true };
  }
}
