import { Module } from '@nestjs/common';
import { RoleSkillMappingService } from './role-skill-mapping.services';
import { RollSkillMappingController } from './role-skill-mapping.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [RollSkillMappingController],
    providers: [RoleSkillMappingService],
})
export class RoleMappingModule { }
