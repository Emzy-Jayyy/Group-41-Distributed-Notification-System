import { Module } from '@nestjs/common';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { StatusLog } from 'src/models/status-log.model';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    SequelizeModule.forFeature([StatusLog]),
    RedisModule
  ],
  controllers: [StatusController],
  providers: [StatusService],
  exports: [StatusService],
})
export class StatusModule {}

