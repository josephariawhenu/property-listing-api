import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateViewingDto {
  @ApiProperty({
    description: 'Property ID',
    example: 'property-uuid',
  })
  @IsString()
  propertyId: string;

  @ApiProperty({
    description: 'Agent ID',
    example: 'agent-profile-id',
  })
  @IsString()
  agentId: string;

  @ApiProperty({
    description: 'Viewing scheduled date and time (ISO 8601)',
    example: '2026-07-15T14:00:00Z',
  })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({
    description: 'Optional notes about the viewing request',
    required: false,
    example: 'Please bring keys to front entrance',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
