import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private config: ConfigService) {
    const url = config.get<string>('DATABASE_URL');

    if (!url) {
      throw new Error('DATABASE_URL is not defined');
    }

    const adapter = new PrismaPg({
      connectionString: url,
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
