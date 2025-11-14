import { Module, Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return { success: true, message: 'ok' };
  }

  @Get('ready')
  ready() {
    return { success: true, message: 'service ready' };
  }
}

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
