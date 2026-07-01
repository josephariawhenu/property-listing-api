import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { SearchPropertyDto } from './dto/search-property.dto';
// import { Prisma } from '../generated/prisma';

@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new property listing
   * Only AGENT or ADMIN users can create properties
   */
  async create(createPropertyDto: CreatePropertyDto, agentId: string) {
    const { images, ...propertyData } = createPropertyDto;

    const property = await this.prisma.property.create({
      data: {
        ...propertyData,
        type: propertyData.type as any,
        propertyType: propertyData.propertyType as any,
        agentId,
      },
      include: {
        agent: {
          include: {
            user: true,
          },
        },
        images: true,
      },
    });

    return property;
  }

  /**
   * Search and filter properties with pagination
   * Public endpoint - only returns approved properties
   */
  async searchProperties(searchDto: SearchPropertyDto) {
    const {
      page = 1,
      limit = 10,
      city,
      type,
      propertyType,
      minPrice,
      maxPrice,
      minBedrooms,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = searchDto;

    const skip = (page - 1) * limit;

    // Build where clause dynamically
    const whereClause: any = {
      isApproved: true,
    };

    if (city) {
      whereClause.city = {
        contains: city,
        mode: 'insensitive',
      };
    }

    if (type) {
      whereClause.type = type;
    }

    if (propertyType) {
      whereClause.propertyType = propertyType;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.price = {};
      if (minPrice !== undefined) whereClause.price.gte = minPrice;
      if (maxPrice !== undefined) whereClause.price.lte = maxPrice;
    }

    if (minBedrooms !== undefined) {
      whereClause.bedrooms = {
        gte: minBedrooms,
      };
    }

    // Build order by
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy,
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
      }),
      this.prisma.property.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: properties,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get a single property with all details
   */
  async findById(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
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
            viewings: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return property;
  }

  /**
   * Get all properties for a specific agent
   */
  async findByAgent(agentId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where: { agentId },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          images: true,
          _count: {
            select: {
              saved: true,
              viewings: true,
            },
          },
        },
      }),
      this.prisma.property.count({ where: { agentId } }),
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
   * Update property (only by agent who created it or admin)
   */
  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    userId: string,
    userRole: string,
  ) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { agent: true },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    // Check authorization
    if (userRole !== 'ADMIN' && property.agent.userId !== userId) {
      throw new BadRequestException('You can only update your own properties');
    }

    const updated = await this.prisma.property.update({
      where: { id },
      data: {
        ...updatePropertyDto,
        type: updatePropertyDto.type
          ? (updatePropertyDto.type as any)
          : undefined,
        propertyType: updatePropertyDto.propertyType
          ? (updatePropertyDto.propertyType as any)
          : undefined,
      },
      include: {
        agent: {
          include: {
            user: true,
          },
        },
        images: true,
      },
    });

    return updated;
  }

  /**
   * Delete property (only by agent who created it or admin)
   */
  async delete(id: string, userId: string, userRole: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { agent: true },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    // Check authorization
    if (userRole !== 'ADMIN' && property.agent.userId !== userId) {
      throw new BadRequestException('You can only delete your own properties');
    }

    await this.prisma.property.delete({ where: { id } });

    return { message: 'Property deleted successfully' };
  }

  /**
   * Admin: Approve/reject property
   */
  async approveProperty(id: string, isApproved: boolean) {
    const property = await this.prisma.property.findUnique({ where: { id } });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    const updated = await this.prisma.property.update({
      where: { id },
      data: { isApproved },
      include: {
        agent: {
          include: {
            user: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Admin: Feature/unfeature property
   */
  async featureProperty(id: string, isFeatured: boolean) {
    const property = await this.prisma.property.findUnique({ where: { id } });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    const updated = await this.prisma.property.update({
      where: { id },
      data: { isFeatured },
    });

    return updated;
  }

  /**
   * Get featured properties
   */
  async getFeaturedProperties(limit = 6) {
    const properties = await this.prisma.property.findMany({
      where: {
        isApproved: true,
        isFeatured: true,
      },
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
    });

    return properties;
  }
}
