import { Module } from '@nestjs/common';
import { ViewingsService } from './viewings.service';
import { ViewingsController } from './viewings.controller';

@Module({
  providers: [ViewingsService],
  controllers: [ViewingsController]
})
export class ViewingsModule {}
