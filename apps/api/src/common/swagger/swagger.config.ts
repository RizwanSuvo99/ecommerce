import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger';

export interface SwaggerConfigOptions {
  title?: string;
  description?: string;
  version?: string;
  path?: string;
  bearerAuth?: boolean;
}

const DEFAULT_OPTIONS: SwaggerConfigOptions = {
  title: 'Bangladesh E-Commerce API',
  description: `
## Overview

RESTful API for the Bangladesh E-Commerce Platform. This API provides endpoints for managing products, orders, users, payments, and all other e-commerce functionality.

## Authentication

Most endpoints require authentication via JWT Bearer tokens. To authenticate:

1. Call \`POST /api/auth/login\` with your credentials
2. Use the returned \`accessToken\` in the \`Authorization\` header: \`Bearer <token>\`
3. When the access token expires, use \`POST /api/auth/refresh\` with your \`refreshToken\`

## Rate Limiting

- General API: 30 requests/second
- Authentication endpoints: 5 requests/minute
- File uploads: 10 requests/minute

## Localization

The API supports bilingual content (English and Bangla). Use the \`Accept-Language\` header:
- \`en\` - English (default)
- \`bn\` - Bangla (বাংলা)

## Error Handling

All errors follow a consistent format:

\`\`\`json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "VALIDATION",
  "errorCode": "VALIDATION_ERROR",
  "correlationId": "uuid",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "path": "/api/resource"
}
\`\`\`

## Pagination

List endpoints support pagination via query parameters:
- \`page\` - Page number (default: 1)
- \`limit\` - Items per page (default: 20, max: 100)
- \`sort\` - Sort field
- \`order\` - Sort order (\`asc\` or \`desc\`)
  `,
  version: '1.0.0',
  path: 'api/docs',
  bearerAuth: true,
};

/**
 * Configure and mount Swagger UI for the NestJS application
 */
export function setupSwagger(
  app: INestApplication,
  options: SwaggerConfigOptions = {},
): OpenAPIObject {
  const config = { ...DEFAULT_OPTIONS, ...options };

  const builder = new DocumentBuilder()
    .setTitle(config.title!)
    .setDescription(config.description!)
    .setVersion(config.version!)
    .setContact(
      'E-Commerce API Support',
      'https://github.com/RizwanSuvo99/ecommerce',
      'support@ecommerce.com.bd',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3001', 'Local Development')
    .addServer('https://staging-api.ecommerce.com.bd', 'Staging')
    .addServer('https://api.ecommerce.com.bd', 'Production')
    .addTag('Auth', 'Authentication and authorization endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Products', 'Product catalog endpoints')
    .addTag('Categories', 'Product category endpoints')
    .addTag('Brands', 'Brand management endpoints')
    .addTag('Cart', 'Shopping cart endpoints')
    .addTag('Orders', 'Order management endpoints')
    .addTag('Payment', 'Payment processing endpoints')
    .addTag('Reviews', 'Product review endpoints')
    .addTag('Wishlist', 'Wishlist management endpoints')
    .addTag('Coupons', 'Coupon and discount endpoints')
    .addTag('Search', 'Search and filtering endpoints')
    .addTag('Upload', 'File upload endpoints')
    .addTag('Admin', 'Admin panel endpoints')
    .addTag('Settings', 'Application settings endpoints')
    .addTag('Health', 'Health check endpoints');

  if (config.bearerAuth) {
    builder.addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'access-token',
    );
    builder.addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT Refresh',
        description: 'Enter JWT refresh token',
        in: 'header',
      },
      'refresh-token',
    );
  }

  const document = SwaggerModule.createDocument(app, builder.build(), {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}_${methodKey}`,
  });

  SwaggerModule.setup(config.path!, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
      tryItOutEnabled: true,
    },
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { font-size: 2em; }
    `,
    customSiteTitle: 'E-Commerce API Documentation',
    customfavIcon: '/favicon.ico',
  });

  return document;
}
