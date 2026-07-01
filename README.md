# 🏠 Property Listing Platform API

A full-featured real estate listing platform backend built with NestJS, PostgreSQL, and Prisma. Like Zillow, but with robust testing and no dark patterns.

## ✨ Features

### Core Functionality

- **User Authentication & Authorization** - JWT-based auth with role-based access control (BUYER, AGENT, ADMIN)
- **Property Management** - Agents post listings with multiple images; Admin approves before public display
- **Advanced Search & Filtering** - Filter by city, type (SALE/RENT), property type, price range, bedrooms
- **Favorites System** - Buyers save properties to their favorites
- **Viewing Scheduler** - Request & manage property viewings with conflict prevention
- **Admin Dashboard** - Approve properties, feature listings, manage users

### Technical Highlights

✅ 80%+ unit test coverage (PropertyService)  
✅ E2E tests for complete workflows  
✅ Swagger/OpenAPI documentation  
✅ Dockerized for easy deployment  
✅ Prisma ORM with migrations  
✅ Cascading deletes for data integrity  
✅ Pagination & sorting on all list endpoints  
✅ Input validation & error handling

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: NestJS 11
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **Testing**: Jest
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Docker & Render

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 15+
- pnpm (or npm)

## 🚀 Local Development

### 1. Clone & Install

```bash
git clone <repo-url>
cd property-listing-platform-api
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Update `.env`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/property
JWT_SECRET=your-super-secret-key
NODE_ENV=development
```

### 3. Database Setup

```bash
pnpm prisma migrate dev --name init
pnpm prisma generate
```

### 4. Start Development Server

```bash
pnpm start:dev
```

Server runs at `http://localhost:3000`  
API Docs at `http://localhost:3000/docs`

## 🐳 Docker Development

```bash
docker-compose up -d
```

This starts PostgreSQL and the NestJS app. Logs available via:

```bash
docker-compose logs -f app
```

## 📚 API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/signin` - Login user (returns JWT)
- `GET /api/v1/auth/signout` - Logout

### Properties

- `POST /api/v1/properties` - Create property (Agent)
- `GET /api/v1/properties/search` - Search/filter properties
- `GET /api/v1/properties/:id` - Get property details
- `PATCH /api/v1/properties/:id` - Update property (Owner/Admin)
- `DELETE /api/v1/properties/:id` - Delete property (Owner/Admin)
- `GET /api/v1/properties/agent/listings` - Get agent's properties
- `GET /api/v1/properties/featured` - Get featured properties

### Saved Properties

- `POST /api/v1/saved-properties/:propertyId` - Save property
- `DELETE /api/v1/saved-properties/:propertyId` - Unsave property
- `GET /api/v1/saved-properties` - Get user's saved properties

### Viewings

- `POST /api/v1/viewings` - Request viewing
- `GET /api/v1/viewings/:id` - Get viewing details
- `PATCH /api/v1/viewings/:id/status` - Update status (Agent)
- `DELETE /api/v1/viewings/:id/cancel` - Cancel viewing (Buyer)
- `GET /api/v1/viewings/agent/list` - Agent's viewings
- `GET /api/v1/viewings/buyer/list` - Buyer's viewings

### Admin

- `GET /api/v1/admin/dashboard/stats` - Dashboard statistics
- `GET /api/v1/admin/properties/pending-approval` - Pending approvals
- `PATCH /api/v1/admin/properties/:id/approve` - Approve property
- `PATCH /api/v1/admin/properties/:id/feature` - Feature property
- `GET /api/v1/admin/users` - All users
- `GET /api/v1/admin/agents` - All agents

## 🧪 Testing

### Run Unit Tests

```bash
pnpm test
```

### Run E2E Tests

```bash
pnpm test:e2e
```

### Test Coverage

```bash
pnpm test:cov
```

Target: 80%+ coverage on core services

## 📁 Project Structure

```
src/
├── auth/              # Authentication & JWT
├── property/          # Property CRUD & search
├── saved-property/    # Favorites management
├── viewing/           # Viewing scheduling
├── admin/             # Admin operations
├── agent-profile/     # Agent profiles
├── property-image/    # Image management
├── app.module.ts      # Root module
└── main.ts            # Entry point

prisma/
├── schema.prisma      # Database schema
└── migrations/        # Database migrations

test/
└── app.e2e-spec.ts    # E2E tests
```

## 🔐 Authentication

All protected endpoints require a Bearer token:

```bash
Authorization: Bearer <jwt_token>
```

Token obtained from `/auth/signin` or `/auth/signup`

## 🎯 Key Business Rules

✅ Agents can only update their own properties  
✅ Admin can approve/reject properties  
✅ Buyers cannot book conflicting viewings  
✅ Properties must be approved before appearing in search  
✅ First image uploaded becomes primary  
✅ Max 8 images per property  
✅ SavedProperty maintains uniqueness (user can't save same property twice)

## 🚢 Deployment

### Deploy to Render

1. Push code to GitHub
2. Connect repo to Render
3. Set environment variables:
   - `DATABASE_URL` - PostgreSQL connection
   - `JWT_SECRET` - Strong random key
   - `NODE_ENV` - production
4. Deploy

Live API will be at `https://your-app.onrender.com`

### Alternative: Docker Deployment

```bash
docker build -t property-api:latest .
docker run -e DATABASE_URL=... -e JWT_SECRET=... -p 3000:3000 property-api:latest
```

## 📊 Data Models

### User

- id, name, email, hashedPassword, role (BUYER|AGENT|ADMIN)
- Relationships: agentProfile, savedProperties, viewings

### AgentProfile

- id, userId, agency, licenseNumber, bio, rating
- Relationships: user, properties

### Property

- id, agentId, title, description, price, type (SALE|RENT)
- propertyType (HOUSE|APARTMENT|LAND|COMMERCIAL)
- bedrooms, bathrooms, area, address, city
- isApproved, isFeatured

### PropertyImage

- id, propertyId, imageUrl, isPrimary, order
- filename, mimeType, size

### SavedProperty

- id, userId, propertyId, savedAt

### Viewing

- id, propertyId, buyerId, agentId
- scheduledAt, status (PENDING|CONFIRMED|CANCELLED|COMPLETED)
- notes

## 🐛 Troubleshooting

### Database Connection Error

```
Error: ECONNREFUSED
```

- Ensure PostgreSQL is running: `docker-compose up postgres`
- Check DATABASE_URL in .env

### Prisma Generation Error

```bash
pnpm prisma generate
pnpm prisma migrate deploy
```

### JWT Errors

- Ensure `JWT_SECRET` is set in .env
- Token may have expired (expires in 7 days)

## 📝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Write tests for new code
3. Commit: `git commit -m 'Add amazing feature'`
4. Push & create PR

## 📄 License

MIT License - see LICENSE file

## 👥 Team

Built as part of Backend Engineering Exam - Property Listing Platform Project

---

**Ready to list properties?** Start the server and visit `/docs` for interactive API testing! 🚀
$ pnpm run test

# e2e tests

$ pnpm run test:e2e

# test coverage

$ pnpm run test:cov

````

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
````

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
