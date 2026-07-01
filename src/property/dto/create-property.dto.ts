import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  Min,
  IsOptional,
  IsArray,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreatePropertyDto {
  @ApiProperty({
    description: 'Property title/name',
    example: 'Beautiful 3-Bedroom House in Downtown',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Detailed property description',
    example: 'A stunning house with modern amenities and garden',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Property price',
    example: 450000,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Listing type',
    enum: ['SALE', 'RENT'],
    example: 'SALE',
  })
  @IsEnum(['SALE', 'RENT'])
  type: string;

  @ApiProperty({
    description: 'Property type',
    enum: ['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL'],
    example: 'HOUSE',
  })
  @IsEnum(['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL'])
  propertyType: string;

  @ApiProperty({
    description: 'Number of bedrooms',
    example: 3,
  })
  @IsNumber()
  @Min(0)
  bedrooms: number;

  @ApiProperty({
    description: 'Number of bathrooms',
    example: 2,
  })
  @IsNumber()
  @Min(0)
  bathrooms: number;

  @ApiProperty({
    description: 'Property area in square feet',
    example: 2500,
  })
  @IsNumber()
  @Min(0)
  area: number;

  @ApiProperty({
    description: 'Street address',
    example: '123 Main Street',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'City name',
    example: 'New York',
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Property images (URLs)',
    type: [String],
    required: false,
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  @IsOptional()
  @IsArray()
  images?: string[];
}
