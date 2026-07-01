import { Module } from '@nestjs/common';
import { AgentProfileService } from './agent-profile.service';
import { AgentProfileController } from './agent-profile.controller';

@Module({
  controllers: [AgentProfileController],
  providers: [AgentProfileService],
  exports: [AgentProfileService],
})
export class AgentProfileModule {}
