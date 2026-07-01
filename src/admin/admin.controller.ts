import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Admin')
@Controller({ path: 'admin', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard/stats')
  @ApiOperation({
    summary: 'Dashboard Statistics',
    description: 'Get platform statistics for admin dashboard',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard stats retrieved',
  })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('properties/pending-approval')
  @ApiOperation({
    summary: 'Get Pending Approvals',
    description: 'Get all properties pending admin approval',
  })
  async getPendingApprovals(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getPendingApprovals(page, limit);
  }

  @Patch('properties/:id/approve')
  @ApiOperation({
    summary: 'Approve Property',
    description: 'Approve a property listing for public display',
  })
  async approveProperty(@Param('id') propertyId: string) {
    return this.adminService.approveProperty(propertyId);
  }

  @Patch('properties/:id/reject')
  @ApiOperation({
    summary: 'Reject Property',
    description: 'Reject a property listing',
  })
  async rejectProperty(@Param('id') propertyId: string) {
    return this.adminService.rejectProperty(propertyId);
  }

  @Patch('properties/:id/feature')
  @ApiOperation({
    summary: 'Feature Property',
    description: 'Mark a property as featured',
  })
  async featureProperty(@Param('id') propertyId: string) {
    return this.adminService.featureProperty(propertyId);
  }

  @Patch('properties/:id/unfeature')
  @ApiOperation({
    summary: 'Unfeature Property',
    description: 'Remove featured status from a property',
  })
  async unfeatureProperty(@Param('id') propertyId: string) {
    return this.adminService.unfeatureProperty(propertyId);
  }

  @Get('users')
  @ApiOperation({
    summary: 'Get All Users',
    description: 'Get all platform users with optional role filter',
  })
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
  ) {
    return this.adminService.getAllUsers(page, limit, role);
  }

  @Get('agents')
  @ApiOperation({
    summary: 'Get All Agents',
    description: 'Get all agents with their profiles and property counts',
  })
  async getAgents(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getAgents(page, limit);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete User',
    description: 'Delete a user account (cascades to related data)',
  })
  async deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId);
  }
}
