import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/client/client';
import { UsersService } from '../users/users.service';
import { EmployeeProfileCreateInput } from 'src/generated/client/models';

@Injectable()
export class EmployeeProfileService {
    constructor(private prisma: PrismaService) { }

    async create(data: EmployeeProfileCreateInput) {
        // Check if the user exists by userId
        const userExists = await this.prisma.user.findUnique({
            where: { email: data.userEmail }
        });
        if (!userExists) {
            throw new Error(`User with ID ${data.userEmail} does not exist`);
        }
        
        // Proceed with creation if user exists
        return this.prisma.employeeProfile.create({
            data
        });
    }

    async findAll() {
        return this.prisma.employeeProfile.findMany();
    }

    async findOne(id: number) {
        return this.prisma.employeeProfile.findUnique({ where: { id } });
    }

    async update(id: number, data: Prisma.EmployeeProfileUpdateInput) {
        return this.prisma.roleSkillMapping.update({ where: { id }, data });
    }

    async remove(id: number) {
        return this.prisma.roleSkillMapping.delete({ where: { id } });
    }

    async importFromExcel(file: any) {
        // This is a placeholder for actual Excel parsing logic
        // Implementation would depend on 'xlsx' or similar library
        console.log('Importing file:', file);
        return { message: 'Excel import simulated successfully', count: 0 };
    }
}
