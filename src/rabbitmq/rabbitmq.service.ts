import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async connect(retries = 5, delay = 5000) {
    const url = process.env.RABBITMQ_URL;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.logger.log(`Connecting to RabbitMQ (attempt ${attempt})...`);
        this.connection = await amqp.connect(url);
        this.channel = await this.connection.createChannel();

        const exchange = process.env.RABBITMQ_EXCHANGE || 'notifications.direct';
        await this.channel.assertExchange(exchange, 'direct', { durable: true });

        this.logger.log('Connected to RabbitMQ and exchange declared');
        return;
      } catch (err) {
        this.logger.error(`RabbitMQ connection failed (attempt ${attempt}): ${err.message}`);
        if (attempt === retries) {
          this.logger.error('Max retries reached. Continuing without RabbitMQ.');
          return;
        }
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  async publish(exchange: string, routingKey: string, message: any) {
    if (!this.channel) {
      this.logger.warn('RabbitMQ channel not available, skipping publish.');
      return;
    }
    await this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
  }
}
