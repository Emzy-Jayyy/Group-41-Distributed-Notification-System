import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { MessageDto, NotificationDto } from 'src/dto/notification.dto';
import { StatusService } from 'src/status/status.service';

@Injectable()
export class NotificationService implements OnModuleInit, OnModuleDestroy {
  private connection!: amqp.Connection;
  private channel!: amqp.Channel;

  constructor(
    private readonly config: ConfigService,
    private readonly statusService: StatusService,
  ) {}

  async onModuleInit(): Promise<void> {
    const rabbitUrl = this.config.get<string>('rabbitmq.url');
    try {
      this.connection = await amqp.connect(rabbitUrl);
      this.channel = await this.connection.createChannel();

      console.log('✅ RabbitMQ connection & channel established');
    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
    console.log('🧹 RabbitMQ connection closed');
  }

  async sendNotification(payload: NotificationDto) {
    const { type, recipient, template_id, template_vars, title, body, data } =
      payload;
    const notification_id = uuidv4();

    await this.statusService.initStatus(notification_id);

    const message: MessageDto = {
      notification_id,
      type,
      recipient,
      template_id,
      template_vars,
      title,
      body,
      data,
      created_at: new Date().toISOString(),
    };

    const queue =
      type === 'email'
        ? this.config.get<string>('rabbitmq.email_queue')
        : type === 'push'
          ? this.config.get<string>('rabbitmq.push_queue')
          : null;

    if (!queue) throw new Error('Invalid notification type');

    await this.channel.assertQueue(queue, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'notifications.direct',
        'x-dead-letter-routing-key': 'failed.queue',
      },
    });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    return {
      success: true,
      message: `Notification queued successfully`,
      data: { notification_id, queue },
    };
  }
}
