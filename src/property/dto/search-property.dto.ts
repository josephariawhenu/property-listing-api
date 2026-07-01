import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchPropertyDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of results per page',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'Filter by city',
    example: 'New York',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Filter by listing type (SALE or RENT)',
    enum: ['SALE', 'RENT'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['SALE', 'RENT'])
  type?: string;

  @ApiProperty({
    description: 'Filter by property type',
    enum: ['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL'])
  propertyType?: string;

  @ApiProperty({
    description: 'Minimum price filter',
    example: 200000,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({
    description: 'Maximum price filter',
    example: 1000000,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({
    description: 'Minimum number of bedrooms',
    example: 2,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minBedrooms?: number;

  @ApiProperty({
    description: 'Sort by field (createdAt, price, etc.)',
    example: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order (asc or desc)',
    example: 'desc',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: string = 'desc';
}
