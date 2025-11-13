import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import helmet from 'helmet';
import * as bodyParser from 'body-parser';
import morgan from 'morgan';

@Module({})
export class MiddlewareModule implements NestModule {
  constructor(private readonly config: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const user_service_url = this.config.get<string>(
      'services.user_service_url',
    );
    const template_service_url = this.config.get<string>(
      'services.template_service_url',
    );

    // Security headers
    consumer.apply(helmet()).forRoutes('*');

    // CORS
    consumer.apply(cors({ origin: '*' })).forRoutes('*');

    // JSON parsing
    consumer.apply(bodyParser.json({ limit: '5mb' })).forRoutes('*');

    // Logging
    consumer.apply(morgan('combined')).forRoutes('*');

    // Proxying user requests
    // consumer
    //   .apply(
    //     createProxyMiddleware({
    //       target: user_service_url,
    //       changeOrigin: true,
    //       pathRewrite: {
    //         // Auth endpoints
    //         '^/register': '/api/auth/register',
    //         '^/login': '/api/auth/login',
    //         '^/auth/profile': '/api/auth/profile',

    //         // User endpoints
    //         '^/users/me': '/api/users/me',
    //         '^/users/preferences': '/api/users/:id/preferences',
    //         '^/users': '/api/users',

    //         // Health endpoints
    //         '^/user-health': '/health',
    //         '^/user-ready': '/ready',
    //       },
    //       on: {
    //         proxyReq: (proxyReq, req) => {
    //           console.log(`[User Proxy] ${req.method} -> ${req.url}`);
    //         },
    //         error: (err, req, res) => {
    //           console.error(`[User Proxy Error] ${err.message}`);
    //           (res as any).writeHead(502, {
    //             'Content-Type': 'application/json',
    //           });
    //           (res as any).end(
    //             JSON.stringify({
    //               success: false,
    //               message: 'User service proxy error',
    //               error: err.message,
    //             }),
    //           );
    //         },
    //       },
    //     }),
    //   )
    //   .forRoutes(
    //     '/register',
    //     '/login',
    //     '/auth/profile',
    //     '/users',
    //     '/users/me',
    //     '/users/preferences',
    //     '/user-health',
    //     '/user-ready',
    //   );

    // // Proxying template service requests
    // consumer
    // .apply(
    //   createProxyMiddleware({
    //     target: template_service_url,
    //     changeOrigin: true,
    //     pathRewrite: {
    //       '^/templates': '/api/v1/templates',
    //       '^/render': '/api/v1/render',
    //     },
    //     on: {
    //       proxyReq: (proxyReq, req, res) => {
    //           console.log(`[Template Proxy] ${req.method} -> ${req.url}`);
    //         },
    //         error: (err, req, res) => {
    //           console.error(`[Template Proxy Error] ${err.message}`);
    //           (res as any).writeHead(502, {
    //             'Content-Type': 'application/json',
    //           });
    //           (res as any).end(
    //             JSON.stringify({
    //               success: false,
    //               message: 'Template service proxy error',
    //               error: err.message,
    //             }),
    //           );
    //         },
    //       },
    //     }),
    //   )
    //   .forRoutes('/templates', '/render');

    // // Template service health routes
    // consumer
    //   .apply(
    //     createProxyMiddleware({
    //       target: template_service_url,
    //       changeOrigin: true,
    //       pathRewrite: {
    //         '^/template-health': '/',
    //         '^/template-keepalive': '/internal/keepalive',
    //       },
    //       on: {
    //         proxyReq: (proxyReq, req) => {
    //           console.log(
    //             `[Template Health Proxy] ${req.method} -> ${req.url}`,
    //           );
    //         },
    //         error: (err, req, res) => {
    //           console.error(`[Template Health Proxy Error] ${err.message}`);
    //           (res as any).writeHead(502, {
    //             'Content-Type': 'application/json',
    //           });
    //           (res as any).end(
    //             JSON.stringify({
    //               success: false,
    //               message: 'Template health proxy error',
    //               error: err.message,
    //             }),
    //           );
    //         },
    //       },
    //     }),
    //   )
    //   .forRoutes('/template-health', '/template-keepalive');
  }
}
