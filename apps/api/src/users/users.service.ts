import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────────────────
  // Address Management
  // ──────────────────────────────────────────────────────────

  async getAddresses(userId: string) {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return addresses;
  }

  async getAddressById(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException(`Address ${addressId} not found`);
    }

    return address;
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    this.logger.log(`Creating address for user ${userId}: ${dto.city}, ${dto.district}`);

    const existingCount = await this.prisma.address.count({
      where: { userId },
    });

    if (existingCount >= 10) {
      throw new BadRequestException(
        'Maximum 10 addresses allowed per account',
      );
    }

    // If this is the first address or marked as default, update others
    if (dto.isDefault || existingCount === 0) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await this.prisma.address.create({
      data: {
        userId,
        fullName: dto.fullName,
        phone: dto.phone,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        district: dto.district,
        division: dto.division,
        postalCode: dto.postalCode,
        landmark: dto.landmark,
        label: dto.label || 'Home',
        isDefault: dto.isDefault ?? existingCount === 0,
      },
    });

    this.logger.log(`Address ${address.id} created for user ${userId}`);

    return address;
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const existing = await this.getAddressById(userId, addressId);

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const updated = await this.prisma.address.update({
      where: { id: addressId },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Address ${addressId} updated for user ${userId}`);

    return updated;
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.getAddressById(userId, addressId);

    await this.prisma.address.delete({
      where: { id: addressId },
    });

    // If deleted address was default, set the most recent one as default
    if (address.isDefault) {
      const nextDefault = await this.prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (nextDefault) {
        await this.prisma.address.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }

    this.logger.log(`Address ${addressId} deleted for user ${userId}`);

    return { deleted: true, id: addressId };
  }

  async setDefaultAddress(userId: string, addressId: string) {
    await this.getAddressById(userId, addressId);

    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    const updated = await this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    return updated;
  }
}
