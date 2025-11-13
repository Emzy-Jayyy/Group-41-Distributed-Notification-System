import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Redis from 'ioredis';
import { StatusLog } from 'src/models/status-log.model';

@Injectable()
export class StatusService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    @InjectModel(StatusLog) private readonly statusLogModel: typeof StatusLog,
  ) {}

  async initStatus(notification_id: string) {
    const timestamp = new Date().toISOString();

    await this.redisClient.hset(
      `notification:${notification_id}`,
      'status',
      'PENDING',
      'last_updated',
      timestamp,
    );

    await this.statusLogModel.create({
      notification_id,
      status: 'PENDING',
    });
  }

  async setStatus(notification_id: string, status: string) {
    const timestamp = new Date().toISOString();

    await this.redisClient.hset(
      `notification:${notification_id}`,
      'status',
      status,
      'last_updated',
      timestamp,
    );

    const existing = await this.statusLogModel.findOne({
      where: { notification_id },
    });

    if (existing) {
      existing.status = status;
      await existing.save();
    } else {
      await this.statusLogModel.create({
        notification_id,
        status,
      });
    }
  }

  async getStatus(notification_id: string) {
    const cached = await this.redisClient.hgetall(
      `notification:${notification_id}`,
    );
    if (cached && cached.status) {
      return {
        notification_id,
        status: cached.status,
        last_updated: cached.last_updated,
      };
    }

    const log = await this.statusLogModel.findOne({
      where: { notification_id },
      order: [['created_at', 'DESC']],
    });
    if (log) {
      return {
        notification_id,
        status: log.status,
        last_updated: log.updatedAt.toISOString(),
      };
    }
    return {
      notification_id,
      status: 'UNKNOWN',
      last_updated: null,
    };
  }
}
