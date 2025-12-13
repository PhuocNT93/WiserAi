import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserSkillsModule } from './user-skills/user-skills.module';
import { ConfigDataModule } from './config-data/config-data.module';
import { MasterDataModule } from './master-data/master-data.module';
import { CareerPlanModule } from './career-plan/career-plan.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    UserSkillsModule,
    ConfigDataModule,
    MasterDataModule,
    CareerPlanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
