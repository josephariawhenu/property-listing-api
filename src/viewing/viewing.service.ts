import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateViewingDto } from './dto/create-viewing.dto';
import { UpdateViewingDto } from './dto/update-viewing.dto';

@Injectable()
export class ViewingService {
  constructor(private prisma: PrismaService) {}

  async requestViewing(createViewingDto: CreateViewingDto, buyerId: string) {
    const { propertyId, agentId, scheduledAt, notes } = createViewingDto;

    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (!property.isApproved) {
      throw new BadRequestException('Property is not approved yet');
    }

    const conflictingViewing = await this.prisma.viewing.findFirst({
      where: {
        buyerId,
        scheduledAt: new Date(scheduledAt),
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    if (conflictingViewing) {
      throw new ConflictException(
        'You already have a viewing scheduled at this time',
      );
    }

    const propertyConflict = await this.prisma.viewing.findFirst({
      where: {
        propertyId,
        scheduledAt: new Date(scheduledAt),
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    if (propertyConflict) {
      throw new ConflictException(
        'This time slot is already booked for this property',
      );
    }

    const viewing = await this.prisma.viewing.create({
      data: {
        propertyId,
        buyerId,
        agentId,
        scheduledAt: new Date(scheduledAt),
        notes,
      },
      include: {
        property: {
          include: {
            agent: {
              include: {
                user: true,
              },
            },
          },
        },
        buyer: true,
        agent: {
          include: {
            agentProfile: true,
          },
        },
      },
    });

    return viewing;
  }

  async getViewing(id: string) {
    const viewing = await this.prisma.viewing.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            agent: {
              include: {
                user: true,
              },
            },
            images: true,
          },
        },
        buyer: true,
        agent: {
          include: {
            agentProfile: true,
          },
        },
      },
    });

    if (!viewing) {
      throw new NotFoundException('Viewing not found');
    }

    return viewing;
  }

  /**
   * Get all viewings for an agent
   */
  async getAgentViewings(agentId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // First get the agent's user ID from agentId
    const agent = await this.prisma.agentProfile.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const [viewings, total] = await Promise.all([
      this.prisma.viewing.findMany({
        where: { agentId: agent.userId },
        skip,
        take: limit,
        orderBy: {
          scheduledAt: 'asc',
        },
        include: {
          property: {
            include: {
              images: {
                where: { isPrimary: true },
              },
            },
          },
          buyer: true,
        },
      }),
      this.prisma.viewing.count({ where: { agentId: agent.userId } }),
    ]);

    return {
      data: viewings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all viewings requested by a buyer
   */
  async getBuyerViewings(buyerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [viewings, total] = await Promise.all([
      this.prisma.viewing.findMany({
        where: { buyerId },
        skip,
        take: limit,
        orderBy: {
          scheduledAt: 'asc',
        },
        include: {
          property: {
            include: {
              agent: {
                include: {
                  user: true,
                },
              },
              images: true,
            },
          },
          agent: {
            include: {
              agentProfile: true,
            },
          },
        },
      }),
      this.prisma.viewing.count({ where: { buyerId } }),
    ]);

    return {
      data: viewings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update viewing status (confirm, cancel, complete)
   */
  async updateViewingStatus(
    id: string,
    updateViewingDto: UpdateViewingDto,
    userId: string,
  ) {
    const viewing = await this.prisma.viewing.findUnique({
      where: { id },
      include: { agent: true },
    });

    if (!viewing) {
      throw new NotFoundException('Viewing not found');
    }

    // Only agent or admin can update viewing status
    if (viewing.agentId !== userId) {
      throw new BadRequestException(
        'Only the assigned agent can update this viewing',
      );
    }

    const updated = await this.prisma.viewing.update({
      where: { id },
      data: {
        status: updateViewingDto.status as any,
        notes: updateViewingDto.notes,
      },
      include: {
        property: {
          include: {
            agent: {
              include: {
                user: true,
              },
            },
          },
        },
        buyer: true,
      },
    });

    return updated;
  }

  /**
   * Cancel viewing (by buyer)
   */
  async cancelViewing(id: string, userId: string) {
    const viewing = await this.prisma.viewing.findUnique({
      where: { id },
    });

    if (!viewing) {
      throw new NotFoundException('Viewing not found');
    }

    // Only buyer can cancel their own viewing
    if (viewing.buyerId !== userId) {
      throw new BadRequestException('You can only cancel your own viewings');
    }

    const cancelled = await this.prisma.viewing.update({
      where: { id },
      data: { status: 'CANCELLED' as any },
    });

    return cancelled;
  }

  /**
   * Get upcoming viewings (for agent dashboard)
   */
  async getUpcomingViewings(agentId: string) {
    const now = new Date();

    const agent = await this.prisma.agentProfile.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const viewings = await this.prisma.viewing.findMany({
      where: {
        agentId: agent.userId,
        scheduledAt: {
          gte: now,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
      take: 10,
      include: {
        property: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        buyer: true,
      },
    });

    return viewings;
  }
}
