import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const compression = require('compression');
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') ?? 8080;
  const isDev = config.get<string>('NODE_ENV') !== 'production';

  const rawCorsOrigins = config.get<string>('CORS_ORIGINS') ?? '';
  const corsOrigins = rawCorsOrigins.split(',').map((o) => o.trim()).filter(Boolean);

  app.use(
    helmet({
      contentSecurityPolicy: false, // disabled for API server
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());

  // In development (Replit preview), allow all origins so the proxied frontend can reach the API.
  app.enableCors({
    origin: isDev ? true : corsOrigins.length > 0 ? corsOrigins : false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.setGlobalPrefix('api');

  if (config.get<string>('SWAGGER_ENABLED') !== 'false') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Aldakron API')
      .setDescription('واجهة برمجة تطبيقات منصة الذَّاكِرُون')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  app.enableShutdownHooks();
  await app.listen(port);
  console.log(`🚀 Aldakron API running on http://localhost:${port}/api`);
}

bootstrap();
