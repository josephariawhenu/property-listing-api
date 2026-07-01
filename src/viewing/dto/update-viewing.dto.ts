import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateViewingDto {
  @ApiProperty({
    description: 'Viewing status',
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
    example: 'CONFIRMED',
  })
  @IsEnum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
  status: string;

  @ApiProperty({
    description: 'Optional notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
