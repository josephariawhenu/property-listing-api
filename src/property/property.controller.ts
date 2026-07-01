import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { SearchPropertyDto } from './dto/search-property.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Properties')
@Controller({ path: 'properties', version: '1' })
export class PropertyController {
  constructor(private propertyService: PropertyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Property Listing',
    description:
      'Create a new property listing. Only AGENT and ADMIN users can create properties. Listing requires admin approval before appearing publicly.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Property created successfully',
    example: {
      id: 'property-uuid',
      title: 'Beautiful 3-Bedroom House',
      price: 450000,
      city: 'New York',
      isApproved: false,
      isFeatured: false,
    },
  })
  async createProperty(
    @Body() createPropertyDto: CreatePropertyDto,
    @Req() req: any,
  ) {
    return this.propertyService.create(createPropertyDto, req.user.agentId);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search Properties',
    description:
      'Search and filter approved properties with pagination. Supports filtering by city, type, price range, and more.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Results per page (default: 10)',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    type: String,
    description: 'Filter by city',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['SALE', 'RENT'],
    description: 'Filter by listing type',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Properties found',
    example: {
      data: [
        {
          id: 'property-uuid',
          title: 'Beautiful House',
          price: 450000,
          city: 'New York',
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5,
      },
    },
  })
  async searchProperties(@Query() searchDto: SearchPropertyDto) {
    return this.propertyService.searchProperties(searchDto);
  }

  @Get('featured')
  @ApiOperation({
    summary: 'Get Featured Properties',
    description:
      'Retrieve featured properties that are highlighted on the platform',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Featured properties retrieved',
  })
  async getFeaturedProperties(@Query('limit') limit?: number) {
    return this.propertyService.getFeaturedProperties(limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Property Details',
    description:
      'Get detailed information about a specific property including images and agent info',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Property details retrieved',
  })
  async getProperty(@Param('id') id: string) {
    return this.propertyService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Property',
    description:
      'Update property details. Only the agent who created it or admin can update.',
  })
  async updateProperty(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertyService.update(
      id,
      updatePropertyDto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete Property',
    description:
      'Delete a property listing. Only the agent who created it or admin can delete.',
  })
  async deleteProperty(@Param('id') id: string, @Req() req: any) {
    return this.propertyService.delete(id, req.user.id, req.user.role);
  }

  @Get('agent/listings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Agent Properties',
    description: 'Retrieve all properties listed by the authenticated agent',
  })
  async getAgentProperties(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.propertyService.findByAgent(req.user.agentId, page, limit);
  }
}
