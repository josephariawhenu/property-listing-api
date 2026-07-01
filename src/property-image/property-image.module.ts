import { Module } from '@nestjs/common';
import { PropertyImageService } from './property-image.service';

@Module({
  providers: [PropertyImageService],
  exports: [PropertyImageService],
})
export class PropertyImageModule {}
