import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  AgentProfileService,
  CreateAgentProfileDto,
} from './agent-profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Agent Profile')
@Controller({ path: 'agent-profile', version: '1' })
export class AgentProfileController {
  constructor(private agentProfileService: AgentProfileService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Agent Profile',
    description: 'Create an agent profile and convert user role to AGENT',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Agent profile created successfully',
  })
  async createProfile(
    @Body() createDto: CreateAgentProfileDto,
    @Req() req: any,
  ) {
    return this.agentProfileService.createProfile(req.user.id, createDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get My Profile',
    description: 'Get authenticated agent profile',
  })
  async getMyProfile(@Req() req: any) {
    return this.agentProfileService.getProfile(req.user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update My Profile',
    description: 'Update authenticated agent profile',
  })
  async updateProfile(
    @Body() updateDto: Partial<CreateAgentProfileDto>,
    @Req() req: any,
  ) {
    return this.agentProfileService.updateProfile(req.user.id, updateDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Agent Profile',
    description: 'Get public agent profile by ID',
  })
  async getAgent(@Param('id') agentId: string) {
    return this.agentProfileService.getAgentById(agentId);
  }
}
