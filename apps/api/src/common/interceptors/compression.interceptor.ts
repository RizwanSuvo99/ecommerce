import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Request, Response } from 'express';
import * as zlib from 'zlib';

@Injectable()
export class CompressionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CompressionInterceptor.name);
  private readonly MIN_COMPRESSION_SIZE = 1024; // 1KB minimum

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const acceptEncoding = request.headers['accept-encoding'] || '';

    return next.handle().pipe(
      map((data) => {
        const json = JSON.stringify(data);

        // Skip compression for small responses
        if (json.length < this.MIN_COMPRESSION_SIZE) {
          return data;
        }

        if (acceptEncoding.includes('gzip')) {
          const compressed = zlib.gzipSync(json);
          response.setHeader('Content-Encoding', 'gzip');
          response.setHeader('Content-Type', 'application/json');
          response.setHeader('Vary', 'Accept-Encoding');
          response.end(compressed);
          return;
        }

        if (acceptEncoding.includes('deflate')) {
          const compressed = zlib.deflateSync(json);
          response.setHeader('Content-Encoding', 'deflate');
          response.setHeader('Content-Type', 'application/json');
          response.setHeader('Vary', 'Accept-Encoding');
          response.end(compressed);
          return;
        }

        return data;
      }),
    );
  }
}
