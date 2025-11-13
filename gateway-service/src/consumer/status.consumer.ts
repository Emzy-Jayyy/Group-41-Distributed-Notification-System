import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Connection, Channel, ConsumeMessage } from 'amqplib';
import { StatusService } from 'src/status/status.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StatusConsumerService implements OnModuleInit, OnModuleDestroy {
  private channel!: Channel;

  constructor(
    @Inject('RABBITMQ_CONNECTION') private readonly rabbitConn: Connection,
    private readonly statusService: StatusService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    this.channel = await this.rabbitConn.createChannel();
    const queue = this.config.get<string>('rabbitmq.status_queue');

    await this.channel.assertQueue(queue, {
      durable: true,
    });

    console.log(`📥 Listening for messages on ${queue}`);

    this.channel.consume(queue, async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const content = msg.content.toString();
        const data = JSON.parse(content);
        await this.statusService.setStatus(data.notification_id, data.status);
        this.channel.ack(msg);
      } catch (error) {
        console.error('❌ Failed to process status message:', error);
        this.channel.nack(msg, false, true);
      }
    });
  }

  async onModuleDestroy() {
    await this.channel?.close();
    console.log('🧹 StatusConsumer channel closed');
  }
}
