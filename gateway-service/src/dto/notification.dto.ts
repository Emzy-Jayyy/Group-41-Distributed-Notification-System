export class NotificationDto {
  type: 'email' | 'push';
  recipient: string;  // email / device_token
  // email
  template_id?: string;
  template_vars?: Record<string, any>;
  // push
  title?: string;
  body?: string;
  data?: Record<string, any>;
};

export class MessageDto {
  notification_id: string;
  type: 'email' | 'push';
  recipient: string;  // email / device_token
  // email
  template_id?: string;
  template_vars?: Record<string, any>;
  // push
  title?: string;
  body?: string;
  data?: Record<string, any>;
  created_at: string;
};
