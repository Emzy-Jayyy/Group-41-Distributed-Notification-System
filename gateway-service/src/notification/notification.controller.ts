import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
// import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotificationDto } from 'src/dto/notification.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notify')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Send a notification (email or push)' })
  @ApiBody({ type: NotificationDto })
  @ApiResponse({ status: 201, description: 'Notification queued successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async createNotification(@Body() body: NotificationDto, @Req() req: any) {
    // const user = req.user;
    const payload = {
      ...body,
      sender: body.sender,
      metadata: {
        request_id: `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
      }
    };
    return this.notificationService.sendNotification(payload);
  };
};
