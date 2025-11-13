import * as dotenv from "dotenv";
dotenv.config();

export default () => ({
  app: {
    name: process.env.APP_NAME || 'notification-gateway',
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
  },
  services: {
    user_service_url: process.env.USER_SERVICE_URL,
    email_service_url: process.env.EMAIL_SERVICE_URL,
    push_service_url: process.env.PUSH_SERVICE_URL,
    template_service_url: process.env.TEMPLATE_SERVICE_URL,
  },
  database: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    name: process.env.DB_NAME || 'gateway_db',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    email_queue: process.env.EMAIL_QUEUE || 'email.queue',
    push_queue: process.env.PUSH_QUEUE || 'push.queue',
    status_queue: process.env.STATUS_QUEUE || 'status.queue',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecret',
  },
});
