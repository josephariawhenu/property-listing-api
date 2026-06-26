import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AgentsModule } from './agents/agents.module';
import { PropertiesModule } from './properties/properties.module';
import { ViewingsModule } from './viewings/viewings.module';
import { SavedModule } from './saved/saved.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [AuthModule, UsersModule, AgentsModule, PropertiesModule, ViewingsModule, SavedModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
