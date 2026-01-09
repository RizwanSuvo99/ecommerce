import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { ImageProcessingService } from './image-processing.service';
import { LocalStorageAdapter } from './adapters/local-storage.adapter';
import { S3StorageAdapter } from './adapters/s3-storage.adapter';
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
    S3StorageAdapter,
    {
      provide: STORAGE_ADAPTER,
      useFactory: (
        configService: ConfigService,
        localStorage: LocalStorageAdapter,
        s3Storage: S3StorageAdapter,
      ) => {
        const storageType = configService.get<string>('STORAGE_TYPE', 'local');

        switch (storageType) {
          case 's3':
            return s3Storage;
          case 'local':
          default:
            return localStorage;
        }
      },
      inject: [ConfigService, LocalStorageAdapter, S3StorageAdapter],
    },
  ],
  exports: [UploadService, ImageProcessingService],
})
export class UploadModule {}
