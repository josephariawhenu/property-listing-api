import { Module } from '@nestjs/common';
import { ViewingService } from './viewing.service';
import { ViewingController } from './viewing.controller';

@Module({
  controllers: [ViewingController],
  providers: [ViewingService],
  exports: [ViewingService],
})
export class ViewingModule {}
