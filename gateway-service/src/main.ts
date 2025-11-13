import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get('app.port');

  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(port, () =>
    console.log(`🚀 ${config.get('app.name')} running on port ${port}`),
  );
}
bootstrap();
