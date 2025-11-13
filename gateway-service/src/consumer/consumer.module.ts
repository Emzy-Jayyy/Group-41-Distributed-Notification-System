import { Module } from '@nestjs/common';
import { StatusConsumerService } from './status.consumer';
import { StatusModule } from 'src/status/status.module';

@Module({
  imports: [StatusModule],
  providers: [StatusConsumerService],
})
export class ConsumerModule {}
