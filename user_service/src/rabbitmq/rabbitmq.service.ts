import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;
type AmqpChannel = Awaited<ReturnType<AmqpConnection['createChannel']>>;

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: AmqpConnection | null = null;
  private channel: AmqpChannel | null = null;
  private readonly exchange = process.env.RABBITMQ_EXCHANGE || 'notifications.direct';

  private batchQueue: Array<{ key: string; message: Record<string, any> }> = [];
  private batchInterval: NodeJS.Timeout | null = null;
  private readonly batchSize = 20;
  private readonly batchTimeMs = 2000;

  async onModuleInit() {
    await this.connect();
  }

  async connect() {
    const url = process.env.RABBITMQ_URL;
    if (!url) throw new Error('Missing RABBITMQ_URL');

    try {
      this.logger.log(`Connecting to RabbitMQ → ${url}`);
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.exchange, 'direct', { durable: true });

      this.logger.log('RabbitMQ connected & exchange declared.');

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed, attempting reconnect...');
        this.connection = null;
        this.channel = null;
        void this.reconnect();
      });

      this.connection.on('error', (err) => {
        this.logger.error(`RabbitMQ connection error: ${err?.message ?? err}`);
      });
    } catch (err) {
      this.logger.error(
        `RabbitMQ connect failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      await this.reconnect();
    }
  }

  private async reconnect(retries = 5, delayMs = 4000): Promise<void> {
    for (let i = 1; i <= retries; i++) {
      this.logger.warn(`Reconnect attempt ${i}/${retries}`);
      try {
        await this.connect();
        return;
      } catch {
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
    this.logger.error('Failed to reconnect to RabbitMQ after retries.');
  }

  // Public publish: routingKey + message
  async publish(routingKey: string, message: Record<string, any>) {
    if (!this.channel) {
      this.logger.warn('Channel not initialized, connecting...');
      await this.connect();
      if (!this.channel) {
        this.logger.error('Failed to get channel after connect.');
        return;
      }
    }

    this.batchQueue.push({ key: routingKey, message });

    if (this.batchQueue.length >= this.batchSize) {
      await this.flushBatch();
      return;
    }

    if (!this.batchInterval) {
      this.batchInterval = setInterval(() => void this.flushBatch(), this.batchTimeMs);
    }
  }

  private async flushBatch() {
    if (!this.channel || this.batchQueue.length === 0) return;
    try {
      for (const item of this.batchQueue) {
        const payload = Buffer.from(JSON.stringify(item.message));
        this.channel.publish(this.exchange, item.key, payload);
      }
      this.logger.log(`Batch published (${this.batchQueue.length})`);
      this.batchQueue = [];
    } catch (err) {
      this.logger.error(
        `Batch publish failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async close() {
    try {
      if (this.batchInterval) clearInterval(this.batchInterval);
      await this.flushBatch();
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      this.logger.log('RabbitMQ closed.');
    } catch (err) {
      this.logger.error(
        `Error closing RabbitMQ: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.close();
  }
}
