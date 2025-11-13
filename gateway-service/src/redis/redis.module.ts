import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (config: ConfigService) => {
        const host =
          config.get<string>('redis.host') || 'redis://localhost:6379';
        const port = config.get<number>('redis.port') || 6379;
        const password = config.get<string>('redis.password');
        return new Redis(port, host, { password });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
