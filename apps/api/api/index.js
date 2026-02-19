/* eslint-disable */
let cachedApp;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Bootstrap timed out after ${ms}ms`)), ms),
    ),
  ]);
}

async function bootstrap() {
  if (cachedApp) return cachedApp;

  const { NestFactory } = require('@nestjs/core');
  const { ExpressAdapter } = require('@nestjs/platform-express');
  const { ValidationPipe, VersioningType } = require('@nestjs/common');
  const express = require('express');
  const path = require('path');

  const distPath = path.join(__dirname, '..', 'dist', 'app.module');
  const { AppModule } = require(distPath);

  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
    abortOnError: false,
  });

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
          .map((o) => o.trim())
          .filter(Boolean)
      : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Session-Id'],
    credentials: true,
    maxAge: 86400,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.init();
  cachedApp = server;
  return cachedApp;
}

module.exports = async function handler(req, res) {
  try {
    const app = await withTimeout(bootstrap(), 25000);
    app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
