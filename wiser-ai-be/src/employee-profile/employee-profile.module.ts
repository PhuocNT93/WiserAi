import { Module } from '@nestjs/common';
import { EmployeeProfileService } from './employee-profile.services';
import { EmployeeProfileController } from './employee-profile.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [EmployeeProfileController],
    providers: [EmployeeProfileService],
})
export class EmployeeProfileModule { }
