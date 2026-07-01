import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, Min, IsOptional } from 'class-validator';

export class UpdatePropertyDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ required: false, enum: ['SALE', 'RENT'] })
  @IsOptional()
  @IsEnum(['SALE', 'RENT'])
  type?: string;

  @ApiProperty({
    required: false,
    enum: ['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL'],
  })
  @IsOptional()
  @IsEnum(['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL'])
  propertyType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bathrooms?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  area?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;
}
