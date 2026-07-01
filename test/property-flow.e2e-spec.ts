import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('Property Listing E2E (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let agentToken: string;
  let buyerToken: string;
  let adminToken: string;

  let propertyId: string;
  let agentUserId: string;
  let buyerUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Clean up database
    await prisma.viewing.deleteMany();
    await prisma.savedProperty.deleteMany();
    await prisma.propertyImage.deleteMany();
    await prisma.property.deleteMany();
    await prisma.agentProfile.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete User Journey', () => {
    it('Agent should sign up', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          name: 'John Agent',
          email: 'agent@example.com',
          password: 'Password123!',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user).toHaveProperty('id');

      agentToken = response.body.access_token;
      agentUserId = response.body.user.id;
    });

    it('Buyer should sign up', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          name: 'Jane Buyer',
          email: 'buyer@example.com',
          password: 'Password123!',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      buyerToken = response.body.access_token;
      buyerUserId = response.body.user.id;
    });

    it('Admin should sign up', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'Password123!',
        })
        .expect(201);

      adminToken = response.body.access_token;

      // Manually set admin role
      await prisma.user.update({
        where: { email: 'admin@example.com' },
        data: { role: 'ADMIN' },
      });
    });

    it('Agent should create property', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/properties')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          title: 'Luxury Downtown Apartment',
          description: 'Beautiful 3-bed apartment in downtown',
          price: 850000,
          type: 'SALE',
          propertyType: 'APARTMENT',
          bedrooms: 3,
          bathrooms: 2,
          area: 1800,
          address: '100 Main Street',
          city: 'New York',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.isApproved).toBe(false);

      propertyId = response.body.id;
    });

    it('Property should not appear in search before approval', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/properties/search')
        .query({ city: 'New York' })
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('Admin should approve property', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/admin/properties/${propertyId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.isApproved).toBe(true);
    });

    it('Property should appear in search after approval', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/properties/search')
        .query({ city: 'New York' })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Luxury Downtown Apartment');
    });

    it('Buyer should search with filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/properties/search')
        .query({
          city: 'New York',
          minPrice: 700000,
          maxPrice: 1000000,
          bedrooms: 3,
        })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it('Buyer should save property to favorites', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/saved-properties/${propertyId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(201);

      expect(response.body.message).toContain('saved');
    });

    it('Buyer should retrieve saved properties', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/saved-properties')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].property.id).toBe(propertyId);
    });

    it('Buyer should request viewing', async () => {
      const scheduledAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      const response = await request(app.getHttpServer())
        .post('/api/v1/viewings')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          propertyId,
          scheduledAt,
          notes: 'Very interested in viewing',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('PENDING');
    });

    it('Agent should see pending viewings', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/viewings/agent/list')
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('Admin should view dashboard stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('totalProperties');
      expect(response.body).toHaveProperty('approvedProperties');
    });
  });

  describe('Authorization & Error Handling', () => {
    it('Should reject request without token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/properties')
        .send({
          title: 'Test',
          price: 100000,
        })
        .expect(401);
    });

    it('Should prevent duplicate saved properties', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/saved-properties/${propertyId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(400);
    });

    it('Should not allow conflicting viewing times', async () => {
      const scheduledAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // First viewing
      await request(app.getHttpServer())
        .post('/api/v1/viewings')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          propertyId,
          scheduledAt,
          notes: 'First attempt',
        });

      // Try same time again (should fail)
      await request(app.getHttpServer())
        .post('/api/v1/viewings')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          propertyId,
          scheduledAt,
          notes: 'Second attempt',
        })
        .expect(409); // Conflict
    });
  });
});
