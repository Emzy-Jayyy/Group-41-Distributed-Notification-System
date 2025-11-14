import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TemplateVarsDto {
  @ApiProperty({ description: 'Language of the template', example: 'en' })
  language: string;
  
  @ApiProperty({ description: 'User-defined variables for the template', type: Object, example: { name: 'Alex', reset_link: 'www.resetpassword.com' } })
  variables: Record<string, any>;
}

export class NotificationDto {
  @ApiProperty({ enum: ['email', 'push'], description: 'Notification type' })
  type: 'email' | 'push';

  @ApiProperty({ description: 'Sender of the notification' })
  sender: string;

  @ApiProperty({ description: 'Recipient email or device token' })
  recipient: string;

  @ApiProperty({ description: 'Subject of the notification' })
  subject: string;

  @ApiPropertyOptional({ description: 'Body of the notification (push notifications)' })
  body?: string;

  @ApiPropertyOptional({ description: 'Template key for email notifications' })
  template_key?: string;

  @ApiPropertyOptional({ description: 'Variables to render in the template', type: Object })
  template_vars?: TemplateVarsDto;

  @ApiPropertyOptional({ description: 'Additional data for push notifications', type: Object })
  data?: Record<string, any>;
}

export class MessageDto {
  @ApiProperty({ description: 'Unique notification ID' })
  notification_id: string;

  @ApiProperty({ enum: ['email', 'push'], description: 'Notification type' })
  type: 'email' | 'push';

  @ApiProperty({ description: 'Sender of the notification' })
  sender: string;

  @ApiProperty({ description: 'Recipient email or device token' })
  recipient: string;

  @ApiProperty({ description: 'Notification subject' })
  subject: string;

  @ApiPropertyOptional({ description: 'Notification body' })
  body?: string;

  @ApiPropertyOptional({ description: 'Push notification data', type: Object })
  data?: Record<string, any>;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: string;
}
