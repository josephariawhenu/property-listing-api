import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SavedPropertyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Save a property to favorites
   */
  async saveProperty(userId: string, propertyId: string) {
    // Check if property exists
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Check if already saved
    const existingSave = await this.prisma.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    if (existingSave) {
      throw new BadRequestException('Property is already saved');
    }

    const saved = await this.prisma.savedProperty.create({
      data: {
        userId,
        propertyId,
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
      },
    });

    return saved;
  }

  /**
   * Unsave a property
   */
  async unsaveProperty(userId: string, propertyId: string) {
    const saved = await this.prisma.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    if (!saved) {
      throw new NotFoundException('Saved property not found');
    }

    await this.prisma.savedProperty.delete({
      where: {
        id: saved.id,
      },
    });

    return { message: 'Property removed from favorites' };
  }

  /**
   * Get all saved properties for a user
   */
  async getUserSavedProperties(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [saved, total] = await Promise.all([
      this.prisma.savedProperty.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: {
          savedAt: 'desc',
        },
        include: {
          property: {
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
              _count: {
                select: {
                  saved: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.savedProperty.count({ where: { userId } }),
    ]);

    return {
      data: saved,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Check if a property is saved by user
   */
  async isSaved(userId: string, propertyId: string) {
    const saved = await this.prisma.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    return !!saved;
  }
}
