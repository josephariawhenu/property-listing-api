import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PropertyService } from '../property/property.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private propertyService: PropertyService,
  ) {}

  /**
   * Get all pending property approvals
   */
  async getPendingApprovals(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where: { isApproved: false },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          agent: {
            include: {
              user: true,
            },
          },
          images: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      }),
      this.prisma.property.count({ where: { isApproved: false } }),
    ]);

    return {
      data: properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Approve property
   */
  async approveProperty(propertyId: string) {
    return this.propertyService.approveProperty(propertyId, true);
  }

  /**
   * Reject property
   */
  async rejectProperty(propertyId: string) {
    return this.propertyService.approveProperty(propertyId, false);
  }

  /**
   * Feature property
   */
  async featureProperty(propertyId: string) {
    return this.propertyService.featureProperty(propertyId, true);
  }

  /**
   * Unfeature property
   */
  async unfeatureProperty(propertyId: string) {
    return this.propertyService.featureProperty(propertyId, false);
  }

  /**
   * Get all users
   */
  async getAllUsers(page = 1, limit = 10, role?: string) {
    const skip = (page - 1) * limit;

    const whereClause: any = role ? { role } : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc' as any,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          createdAt: true,
          agentProfile: true,
        },
      }),
      this.prisma.user.count({ where: whereClause }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get agents with profile info
   */
  async getAgents(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [agents, total] = await Promise.all([
      this.prisma.agentProfile.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: true,
          properties: {
            select: {
              id: true,
              title: true,
              isApproved: true,
            },
          },
          _count: {
            select: {
              properties: true,
            },
          },
        },
      }),
      this.prisma.agentProfile.count(),
    ]);

    return {
      data: agents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [
      totalUsers,
      totalAgents,
      totalProperties,
      approvedProperties,
      pendingApprovals,
      totalViewings,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.agentProfile.count(),
      this.prisma.property.count(),
      this.prisma.property.count({ where: { isApproved: true } }),
      this.prisma.property.count({ where: { isApproved: false } }),
      this.prisma.viewing.count(),
    ]);

    return {
      totalUsers,
      totalAgents,
      totalProperties,
      approvedProperties,
      pendingApprovals,
      totalViewings,
    };
  }

  /**
   * Delete user (soft delete - could archive instead)
   */
  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id === userId) {
      throw new BadRequestException('Cannot delete yourself');
    }

    // Cascade delete will handle related data
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully' };
  }
}
