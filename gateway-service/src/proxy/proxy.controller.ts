import { Controller, Req, Res, Put, Post, Get } from '@nestjs/common';
import {
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { Request, Response } from 'express';
import { CreateTemplateDto, CreateTemplateVersionDto } from 'src/dto/proxy.dto';

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
      email: this.config.get<string>('services.email_service_url') || '',
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

  // Health check for template service
  @Get('template-health')
  templateHealth(@Req() req: Request, @Res() res: Response) {
    return this.forward(this.services.template, req, res, () => '/');
  }

  // Health check for email service
  @Get('email-health')
  emailHealth(@Req() req: Request, @Res() res: Response) {
    return this.forward(this.services.email, req, res, () => '/');
  }

  // Create template
  @Post()
  @ApiOperation({ summary: 'Create a new template' })
  @ApiBody({ type: CreateTemplateDto, description: 'Template details' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  createTemplate(@Req() req: Request, @Res() res: Response) {
    return this.forward(
      this.services.template,
      req,
      res,
      () => '/api/v1/templates',
    );
  }

  // Create template version
  @Post('versions/:template_key')
  @ApiOperation({ summary: 'Create a new template version' })
  @ApiParam({
    name: 'template_key',
    required: true,
    description: 'Template unique key',
  })
  @ApiBody({ type: CreateTemplateVersionDto, description: 'Version details' })
  @ApiResponse({
    status: 201,
    description: 'Template version created successfully',
  })
  createTemplateVersion(@Req() req: Request, @Res() res: Response) {
    return this.forward(
      this.services.template,
      req,
      res,
      () => `/api/v1/templates/versions/${req.params.template_key}`,
    );
  }

  // Activate template
  @Put('versions/:template_key')
  @ApiOperation({ summary: 'Activate a template version' })
  @ApiParam({
    name: 'template_key',
    required: true,
    description: 'Template unique key',
  })
  @ApiQuery({
    name: 'template_version_id',
    required: true,
    description: 'Template version unique id',
  })
  activateTemplate(@Req() req: Request, @Res() res: Response) {
    return this.forward(
      this.services.template,
      req,
      res,
      () =>
        `/api/v1/templates/versions/${req.params.template_key}?version=${req.query.template_version_id}`,
    );
  }

  // Get template
  @Get(':template_key')
  @ApiOperation({ summary: 'Get template by key' })
  @ApiParam({
    name: 'template_key',
    required: true,
    description: 'Template unique key',
  })
  @ApiResponse({ status: 200, description: 'Template fetched successfully' })
  getTemplate(@Req() req: Request, @Res() res: Response) {
    return this.forward(
      this.services.template,
      req,
      res,
      () => `/api/v1/templates/${req.params.template_key}`,
    );
  }
}
