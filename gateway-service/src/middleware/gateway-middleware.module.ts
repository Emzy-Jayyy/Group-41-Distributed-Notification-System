import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cors from 'cors';
import helmet from 'helmet';
import * as bodyParser from 'body-parser';
import morgan from 'morgan';

@Module({})
export class MiddlewareModule implements NestModule {
  constructor(private readonly config: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    // Security headers
    consumer.apply(helmet()).forRoutes('*');

    // CORS
    consumer.apply(cors({ origin: '*' })).forRoutes('*');

    // JSON parsing
    consumer.apply(bodyParser.json({ limit: '5mb' })).forRoutes('*');

    // Logging
    consumer.apply(morgan('combined')).forRoutes('*');
  }
}
