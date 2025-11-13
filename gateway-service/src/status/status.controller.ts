import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { StatusService } from './status.service';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':notification_id')
  async getStatus(@Param('notification_id') notification_id: string) {
    const statusData = await this.statusService.getStatus(notification_id);
    return {
      success: true,
      message: 'Notification status retrieved',
      data: {
        notification_id,
        status: statusData.status,
        last_updated: statusData.last_updated,
      },
    };
  }
}
