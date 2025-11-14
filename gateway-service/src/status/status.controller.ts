import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { StatusService } from './status.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  // @UseGuards(JwtAuthGuard)
  @Get(':notification_id')
  @ApiOperation({ summary: 'Get the status of a notification' })
  @ApiParam({ name: 'notification_id', required: true, description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification status retrieved' })
  async getStatus(@Param('notification_id') notification_id: string) {
    const statusData = await this.statusService.getStatus(notification_id);
    return {
      success: true,
      message: 'Notification status retrieved',
      data: statusData
    };
  }
}
