import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PrismaService } from 'prisma/prisma.service';

describe('PropertyService', () => {
  let service: PropertyService;
  let prisma: PrismaService;

  const mockPrismaService = {
    property: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    agentProfile: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PropertyService>(PropertyService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a property successfully', async () => {
      const createDto = {
        title: 'Beautiful House',
        description: 'A wonderful property',
        price: 500000,
        type: 'SALE',
        propertyType: 'HOUSE',
        bedrooms: 3,
        bathrooms: 2,
        area: 2500,
        address: '123 Main St',
        city: 'New York',
      };

      const mockProperty = { id: 'prop-1', ...createDto, agentId: 'agent-1' };
      mockPrismaService.property.create.mockResolvedValue(mockProperty);

      const result = await service.create(createDto, 'agent-1');

      expect(result).toEqual(mockProperty);
      expect(mockPrismaService.property.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...createDto,
          agentId: 'agent-1',
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('searchProperties', () => {
    it('should search properties with filters', async () => {
      const mockProperties = [
        {
          id: 'prop-1',
          title: 'House 1',
          price: 400000,
          city: 'New York',
          isApproved: true,
        },
      ];

      mockPrismaService.property.findMany.mockResolvedValue(mockProperties);
      mockPrismaService.property.count.mockResolvedValue(1);

      const result = await service.searchProperties({
        page: 1,
        limit: 10,
        city: 'New York',
        minPrice: 300000,
        maxPrice: 600000,
      });

      expect(result.data).toEqual(mockProperties);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by property type', async () => {
      const mockProperties = [
        {
          id: 'prop-1',
          title: 'Apartment',
          propertyType: 'APARTMENT',
          isApproved: true,
        },
      ];

      mockPrismaService.property.findMany.mockResolvedValue(mockProperties);
      mockPrismaService.property.count.mockResolvedValue(1);

      await service.searchProperties({
        propertyType: 'APARTMENT',
      });

      expect(mockPrismaService.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            propertyType: 'APARTMENT',
          }),
        }),
      );
    });

    it('should handle pagination correctly', async () => {
      mockPrismaService.property.findMany.mockResolvedValue([]);
      mockPrismaService.property.count.mockResolvedValue(25);

      const result = await service.searchProperties({
        page: 2,
        limit: 10,
      });

      expect(result.pagination.totalPages).toBe(3);
      expect(mockPrismaService.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (2-1) * 10
          take: 10,
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return a property by id', async () => {
      const mockProperty = { id: 'prop-1', title: 'House' };
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);

      const result = await service.findById('prop-1');

      expect(result).toEqual(mockProperty);
      expect(mockPrismaService.property.findUnique).toHaveBeenCalledWith({
        where: { id: 'prop-1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if property not found', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('approveProperty', () => {
    it('should approve a property', async () => {
      const mockProperty = { id: 'prop-1', isApproved: true };
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);
      mockPrismaService.property.update.mockResolvedValue(mockProperty);

      const result = await service.approveProperty('prop-1', true);

      expect(mockPrismaService.property.update).toHaveBeenCalledWith({
        where: { id: 'prop-1' },
        data: { isApproved: true },
        include: expect.any(Object),
      });
    });

    it('should reject a property', async () => {
      const mockProperty = { id: 'prop-1', isApproved: false };
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);
      mockPrismaService.property.update.mockResolvedValue(mockProperty);

      await service.approveProperty('prop-1', false);

      expect(mockPrismaService.property.update).toHaveBeenCalledWith({
        where: { id: 'prop-1' },
        data: { isApproved: false },
        include: expect.any(Object),
      });
    });
  });

  describe('delete', () => {
    it('should delete property if authorized', async () => {
      const mockProperty = {
        id: 'prop-1',
        agent: { userId: 'user-1' },
      };

      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);
      mockPrismaService.property.delete.mockResolvedValue(mockProperty);

      const result = await service.delete('prop-1', 'user-1', 'AGENT');

      expect(result.message).toBe('Property deleted successfully');
      expect(mockPrismaService.property.delete).toHaveBeenCalledWith({
        where: { id: 'prop-1' },
      });
    });

    it('should throw error if user not authorized to delete', async () => {
      const mockProperty = {
        id: 'prop-1',
        agent: { userId: 'other-user' },
      };

      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);

      await expect(service.delete('prop-1', 'user-1', 'BUYER')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow admin to delete any property', async () => {
      const mockProperty = {
        id: 'prop-1',
        agent: { userId: 'other-user' },
      };

      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);
      mockPrismaService.property.delete.mockResolvedValue(mockProperty);

      await service.delete('prop-1', 'admin-user', 'ADMIN');

      expect(mockPrismaService.property.delete).toHaveBeenCalled();
    });
  });

  describe('featureProperty', () => {
    it('should feature a property', async () => {
      const mockProperty = { id: 'prop-1', isFeatured: true };
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);
      mockPrismaService.property.update.mockResolvedValue(mockProperty);

      await service.featureProperty('prop-1', true);

      expect(mockPrismaService.property.update).toHaveBeenCalledWith({
        where: { id: 'prop-1' },
        data: { isFeatured: true },
      });
    });
  });
});
