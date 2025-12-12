import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserSkillsModule } from './user-skills/user-skills.module';
import { ConfigDataModule } from './config-data/config-data.module';
import { MasterDataModule } from './master-data/master-data.module';
import { CareerPlanModule } from './career-plan/career-plan.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserSkillsModule,
    ConfigDataModule,
    MasterDataModule,
    CareerPlanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
