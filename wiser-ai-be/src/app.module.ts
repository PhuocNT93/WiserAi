import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserSkillsModule } from './user-skills/user-skills.module';
import { ConfigDataModule } from './config-data/config-data.module';
import { RoleMappingModule } from './role-skill-mapping/role-skill-mapping.module';
import { EmployeeProfileModule } from './employee-profile/employee-profile.module';
import { CareerPlanModule } from './career-plan/career-plan.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    UserSkillsModule,
    ConfigDataModule,
    RoleMappingModule,
    EmployeeProfileModule,
    CareerPlanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
