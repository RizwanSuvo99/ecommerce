import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { ImageProcessingService } from './image-processing.service';
import { LocalStorageAdapter } from './adapters/local-storage.adapter';
import { STORAGE_ADAPTER } from './interfaces/storage-adapter.interface';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [UploadController],
  providers: [
    UploadService,
    ImageProcessingService,
    LocalStorageAdapter,
    {
      provide: STORAGE_ADAPTER,
      useExisting: LocalStorageAdapter,
    },
  ],
  exports: [UploadService, ImageProcessingService],
})
export class UploadModule {}
