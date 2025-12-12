import { Module } from '@nestjs/common';
import { UserSkillsService } from './user-skills.service';
import { UserSkillsController } from './user-skills.controller';

@Module({
  controllers: [UserSkillsController],
  providers: [UserSkillsService],
})
export class UserSkillsModule {}
