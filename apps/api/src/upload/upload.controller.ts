import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Interface representing the uploaded file from multer.
 */
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Upload a single file.
   * Accepts multipart/form-data with a "file" field.
   * Restricted to ADMIN and SUPER_ADMIN roles.
   *
   * @param file - The uploaded file
   * @param directory - Optional query parameter to specify storage directory
   * @returns Upload result with URL and metadata
   *
   * @example
   * ```
   * POST /upload?directory=products
   * Content-Type: multipart/form-data
   *
   * file: <binary>
   * ```
   */
  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB max (further validated in service)
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: MulterFile,
    @Query('directory') directory?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided. Please upload a file using the "file" field.');
    }

    return this.uploadService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      {
        directory: directory || 'general',
        isPublic: true,
      },
    );
  }

  /**
   * Upload a single image with image-specific validation.
   * Only accepts image MIME types (jpeg, png, gif, webp, svg).
   *
   * @param file - The uploaded image file
   * @param directory - Optional query parameter to specify storage directory
   * @returns Upload result with URL and metadata
   */
  @Post('image')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB max for images
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: MulterFile,
    @Query('directory') directory?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No image provided. Please upload an image using the "file" field.');
    }

    return this.uploadService.uploadImage(
      file.buffer,
      file.originalname,
      file.mimetype,
      {
        directory: directory || 'images',
        isPublic: true,
      },
    );
  }
}
