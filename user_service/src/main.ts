import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Global prefix
 // app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Environment detection
  const port = process.env.PORT || 3001;
  const env = process.env.NODE_ENV || 'development';
  const baseUrl =
    env === 'production'
      ? process.env.API_BASE_URL || 'https://distributed-notification-system-user-service-production.up.railway.app'
      : `http://localhost:${port}`;

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('User Service API')
    .setDescription(
      'Manages user data, preferences, and authentication for the Distributed Notification System.',
    )
    .setVersion('1.0')
    .addTag('Users')
    .addTag('Preferences')
    .addTag('Health')
    .addServer(baseUrl, `${env.charAt(0).toUpperCase() + env.slice(1)} Environment`)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);

  console.log(`${process.env.SERVICE_NAME || 'User Service'} running on port ${port}`);
  console.log(` Swagger Docs: ${baseUrl}/docs`);
}
bootstrap();
