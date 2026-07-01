import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';
import { PropertyModule } from './property/property.module';
import { SavedPropertyModule } from './saved-property/saved-property.module';
import { ViewingModule } from './viewing/viewing.module';
import { AdminModule } from './admin/admin.module';
import { AgentProfileModule } from './agent-profile/agent-profile.module';
import { PropertyImageModule } from './property-image/property-image.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    PropertyModule,
    SavedPropertyModule,
    ViewingModule,
    AdminModule,
    AgentProfileModule,
    PropertyImageModule,
  ],
})
export class AppModule {}
