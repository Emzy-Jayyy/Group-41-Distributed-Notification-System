import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [ProxyController],
})
export class ProxyModule {}
