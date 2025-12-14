import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [UsersController],
  exports: [UsersService],
  providers: [UsersService, PrismaService],

})
export class UsersModule {}
