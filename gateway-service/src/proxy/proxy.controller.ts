import { Controller, Req, Res, All } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { Request, Response } from 'express';

interface ServiceMap {
  [key: string]: string;
}

@Controller()
export class ProxyController {
  private services: ServiceMap;

  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.services = {
      user: this.config.get<string>('services.user_service_url') || '',
      template: this.config.get<string>('services.template_service_url') || '',
      push: this.config.get<string>('services.push_service_url') || '',
    };
  }

  private async forward(
    target: string,
    req: Request,
    res: Response,
    rewrite?: (url: string) => string,
  ) {
    const cleanTarget = target.replace(/\/+$/, '');
    const path = rewrite ? rewrite(req.originalUrl) : req.originalUrl;
    const cleanPath = path.replace(/^\/+/, '');
    const fullUrl = `${cleanTarget}/${cleanPath}`;

    const {
      host,
      connection,
      'content-length': cl,
      'transfer-encoding': te,
      ...headers
    } = req.headers;

    console.log(`[Proxy] → ${req.method} ${fullUrl}`);

    try {
      const data =
        ['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase()) && req.body
          ? req.body
          : undefined;

      const response = await firstValueFrom(
        this.httpService.request({
          url: fullUrl,
          method: req.method as any,
          headers,
          params: req.query,
          data,
          timeout: 10000,
          httpAgent: new (require('http').Agent)({ keepAlive: true }),
        }),
      );

      return res.status(response.status).json(response.data);
    } catch (err: any) {
      console.error(`[Proxy Error] ${req.method} ${fullUrl}: ${err.message}`);
      return res
        .status(502)
        .json({ success: false, message: 'Proxy failed', error: err.message });
    }
  }

  @All([
    'register',
    'login',
    'auth/profile',
    'users',
    'users/*',
    'user-health',
    'user-ready',
  ])
  proxyUser(@Req() req: Request, @Res() res: Response) {
    const rewrite = (url: string) => {
      url = url.replace(/^\/register/, '/auth/register');
      url = url.replace(/^\/login/, '/auth/login');
      // url = url.replace(/^\/auth\/profile/, '/users/me');
      url = url.replace(/^\/users\/me/, '/users/me');
      url = url.replace(
        /^\/users\/([^/]+)\/preferences/,
        '/users/$1/preferences',
      );
      url = url.replace(/^\/users/, '/api/users');
      url = url.replace(/^\/user-health/, '/health');
      url = url.replace(/^\/user-ready/, '/ready');
      return url;
    };
    return this.forward(this.services.user, req, res, rewrite);
  }

  @All([
    'templates',
    'templates/*',
    'render',
    'template-health',
    'template-keepalive',
  ])
  proxyTemplate(@Req() req: Request, @Res() res: Response) {
    const rewrite = (url: string) => {
      if (url.startsWith('/templates'))
        return url.replace(/^\/templates\/?(.*)$/, '/api/v1/templates/$1');
      if (url.startsWith('/render')) return '/api/v1/render';
      if (url.startsWith('/template-health')) return '/';
      if (url.startsWith('/template-keepalive')) return '/internal/keepalive';
      return url;
    };
    return this.forward(this.services.template, req, res, rewrite);
  }

  @All(['push', 'push/*'])
  proxyPush(@Req() req: Request, @Res() res: Response) {
    const rewrite = (url: string) => url.replace(/^\/push/, '/api/v1/push');
    return this.forward(this.services.push, req, res, rewrite);
  }
}
