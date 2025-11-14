import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get('app.port');

  const swagger_config = new DocumentBuilder()
    .setTitle('Notification Gateway')
    .setDescription('API Gateway for Template Service, Notification Service, and Push Service')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, swagger_config);
  SwaggerModule.setup('docs', app, document);


  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(port, () =>
    console.log(`🚀 ${config.get('app.name')} running on port ${port}`),
  );
}
bootstrap();
