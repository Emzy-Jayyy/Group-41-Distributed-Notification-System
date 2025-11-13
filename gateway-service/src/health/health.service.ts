import { Inject, Injectable } from '@nestjs/common';
import { Connection } from 'amqplib';
import Redis from 'ioredis';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class HealthService {
  constructor(
    @Inject('RABBITMQ_CONNECTION') private rabbitConn: Connection,
    @Inject('REDIS_CLIENT') private redisClient: Redis,
    private readonly sequelize: Sequelize,
  ) {}

  async checkHealth() {
    try {
      await this.redisClient.ping();
      await this.rabbitConn.createChannel();
      await this.sequelize.authenticate();

      return {
        success: true,
        message: 'Gateway health check successful',
        data: {
          rabbitmq: 'connected',
          redis: 'connected',
          database: 'connected',
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Health check failed',
        error: error.message,
      };
    };
  };
};
