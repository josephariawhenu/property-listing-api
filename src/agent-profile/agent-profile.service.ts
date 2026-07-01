import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

export class CreateAgentProfileDto {
  agency: string;
  licenseNumber: string;
  bio?: string;
}

@Injectable()
export class AgentProfileService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, createDto: CreateAgentProfileDto) {
    // Check if agent already has a profile
    const existingProfile = await this.prisma.agentProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new BadRequestException('Agent profile already exists');
    }

    // Update user role to AGENT
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'AGENT' },
    });

    const profile = await this.prisma.agentProfile.create({
      data: {
        userId,
        ...createDto,
      },
      include: {
        user: true,
        properties: true,
      },
    });

    return profile;
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.agentProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        properties: {
          select: {
            id: true,
            title: true,
            price: true,
            isApproved: true,
            isFeatured: true,
          },
        },
        _count: {
          select: {
            properties: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Agent profile not found');
    }

    return profile;
  }

  async updateProfile(
    userId: string,
    updateDto: Partial<CreateAgentProfileDto>,
  ) {
    const profile = await this.prisma.agentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Agent profile not found');
    }

    const updated = await this.prisma.agentProfile.update({
      where: { userId },
      data: updateDto,
      include: {
        user: true,
      },
    });

    return updated;
  }

  async getAgentById(agentId: string) {
    const profile = await this.prisma.agentProfile.findUnique({
      where: { id: agentId },
      include: {
        user: true,
        properties: {
          where: { isApproved: true },
          take: 5,
        },
        _count: {
          select: {
            properties: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Agent not found');
    }

    return profile;
  }
}
