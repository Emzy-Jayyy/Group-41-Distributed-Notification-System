import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotificationDto } from 'src/dto/notification.dto';

@Controller('notify')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createNotification(@Body() body: NotificationDto, @Req() req: any) {
    const user = req.user;
    const payload = {
      ...body,
      sender: user.id,
      metadata: {
        request_id: `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
      }
    };
    return this.notificationService.sendNotification(payload);
  };
};
