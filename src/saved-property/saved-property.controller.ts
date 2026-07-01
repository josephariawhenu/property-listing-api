import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SavedPropertyService } from './saved-property.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Saved Properties')
@Controller({ path: 'saved-properties', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SavedPropertyController {
  constructor(private savedPropertyService: SavedPropertyService) {}

  @Post(':propertyId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Save Property to Favorites',
    description: 'Add a property to user favorites',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Property saved successfully',
  })
  async saveProperty(@Param('propertyId') propertyId: string, @Req() req: any) {
    return this.savedPropertyService.saveProperty(req.user.id, propertyId);
  }

  @Delete(':propertyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove from Favorites',
    description: 'Remove a property from user favorites',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Property removed from favorites',
  })
  async unsaveProperty(
    @Req() req: any,
    @Param('propertyId') propertyId: string,
  ) {
    return this.savedPropertyService.unsaveProperty(req.user.id, propertyId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get User Saved Properties',
    description: 'Retrieve all properties saved by the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Saved properties retrieved',
  })
  async getUserSavedProperties(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.savedPropertyService.getUserSavedProperties(
      req.user.id,
      page,
      limit,
    );
  }

  @Get('check/:propertyId')
  @ApiOperation({
    summary: 'Check if Property is Saved',
    description: 'Check if a property is saved by the authenticated user',
  })
  async checkSaved(@Param('propertyId') propertyId: string, @Req() req: any) {
    const isSaved = await this.savedPropertyService.isSaved(
      req.user.id,
      propertyId,
    );
    return { isSaved };
  }
}
