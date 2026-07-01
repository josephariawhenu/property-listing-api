import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ViewingService } from './viewing.service';
import { CreateViewingDto } from './dto/create-viewing.dto';
import { UpdateViewingDto } from './dto/update-viewing.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Viewings')
@Controller({ path: 'viewings', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ViewingController {
  constructor(private viewingService: ViewingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Request Property Viewing',
    description:
      'Request a viewing for a property. Prevents double-booking for both buyer and property.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Viewing requested successfully',
  })
  async requestViewing(
    @Req() req: any,
    @Body() createViewingDto: CreateViewingDto,
  ) {
    return this.viewingService.requestViewing(createViewingDto, req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Viewing Details',
    description: 'Get detailed information about a viewing',
  })
  async getViewing(@Param('id') id: string) {
    return this.viewingService.getViewing(id);
  }

  @Get('agent/upcoming')
  @ApiOperation({
    summary: 'Get Agent Upcoming Viewings',
    description: 'Get upcoming viewings for the authenticated agent',
  })
  async getUpcomingViewings(@Req() req: any) {
    return this.viewingService.getUpcomingViewings(req.user.agentId);
  }

  @Get('agent/list')
  @ApiOperation({
    summary: 'Get Agent All Viewings',
    description: 'Get all viewings for the authenticated agent with pagination',
  })
  async getAgentViewings(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.viewingService.getAgentViewings(req.user.agentId, page, limit);
  }

  @Get('buyer/list')
  @ApiOperation({
    summary: 'Get My Viewings',
    description: 'Get all viewing requests made by the authenticated buyer',
  })
  async getBuyerViewings(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.viewingService.getBuyerViewings(req.user.id, page, limit);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update Viewing Status',
    description: 'Confirm, cancel, or complete a viewing (agent only)',
  })
  async updateViewingStatus(
    @Param('id') id: string,
    @Body() updateViewingDto: UpdateViewingDto,
    @Req() req: any,
  ) {
    return this.viewingService.updateViewingStatus(
      id,
      updateViewingDto,
      req.user.id,
    );
  }

  @Delete(':id/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Cancel Viewing',
    description: 'Cancel a viewing request (buyer only)',
  })
  async cancelViewing(@Param('id') id: string, @Req() req: any) {
    return this.viewingService.cancelViewing(id, req.user.id);
  }
}
