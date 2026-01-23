import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

import { UsersService } from './users.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ──────────────────────────────────────────────────────────
  // Avatar Upload
  // ──────────────────────────────────────────────────────────

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = (req.user as any).id;
    const result = await this.usersService.uploadAvatar(userId, file);

    return {
      success: true,
      data: result,
    };
  }

  // ──────────────────────────────────────────────────────────
  // Address Endpoints
  // ──────────────────────────────────────────────────────────

  @Get('addresses')
  async getAddresses(@Req() req: Request) {
    const userId = (req.user as any).id;
    const addresses = await this.usersService.getAddresses(userId);

    return {
      success: true,
      data: addresses,
    };
  }

  @Get('addresses/:id')
  async getAddress(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as any).id;
    const address = await this.usersService.getAddressById(userId, id);

    return {
      success: true,
      data: address,
    };
  }

  @Post('addresses')
  async createAddress(
    @Req() req: Request,
    @Body() dto: CreateAddressDto,
  ) {
    const userId = (req.user as any).id;
    const address = await this.usersService.createAddress(userId, dto);

    return {
      success: true,
      data: address,
      message: 'Address added successfully',
    };
  }

  @Put('addresses/:id')
  async updateAddress(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const userId = (req.user as any).id;
    const address = await this.usersService.updateAddress(userId, id, dto);

    return {
      success: true,
      data: address,
      message: 'Address updated successfully',
    };
  }

  @Delete('addresses/:id')
  async deleteAddress(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as any).id;
    const result = await this.usersService.deleteAddress(userId, id);

    return {
      success: true,
      data: result,
      message: 'Address deleted successfully',
    };
  }

  @Patch('addresses/:id/default')
  async setDefaultAddress(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as any).id;
    const address = await this.usersService.setDefaultAddress(userId, id);

    return {
      success: true,
      data: address,
      message: 'Default address updated',
    };
  }

  // ──────────────────────────────────────────────────────────
  // Order History Endpoints
  // ──────────────────────────────────────────────────────────

  @Get('orders')
  async getOrderHistory(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const userId = (req.user as any).id;
    const result = await this.usersService.getOrderHistory(userId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      status,
    });

    return {
      success: true,
      data: result.orders,
      pagination: result.pagination,
    };
  }

  @Get('orders/stats')
  async getOrderStats(@Req() req: Request) {
    const userId = (req.user as any).id;
    const stats = await this.usersService.getOrderStats(userId);

    return {
      success: true,
      data: stats,
    };
  }
}
