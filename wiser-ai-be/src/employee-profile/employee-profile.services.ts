import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/client/client';
import { EmployeeProfileCreateInput } from 'src/generated/client/models';

@Injectable()
export class EmployeeProfileService {
    constructor(private prisma: PrismaService) { }

    async create(data: EmployeeProfileCreateInput) {
        // Check if the user exists by userId
        const userExists = await this.prisma.user.findUnique({
            where: { id: data.user.connect?.id }
        });
        console.log(userExists, "TESTING");
        if (!userExists) {
            return {
                status: 500,
                message: `User Email ${data.user.connect?.email} not found in the system.`,
                data: []
            }
        }
        
        // Proceed with creation if user exists
        return this.prisma.employeeProfile.create({
            data
        })
    }

    async findAll() {
        try {
            return this.prisma.employeeProfile.findMany();
        } catch (error) {
            return {
                status: 500,
                message: `Can not fetch all employee profiles. Error detail :${error}`,
                data: []
            }
        }
    }

    async findOne(id: number) {
        return this.prisma.employeeProfile.findUnique({ where: { id } });
    }

    async update(id: number, data: Prisma.EmployeeProfileUpdateInput) {
        return this.prisma.employeeProfile.update({ where: { id }, data });
    }

    async remove(id: number) {
        return this.prisma.employeeProfile.delete({ where: { id } });
    }

    async importFromExcel(file: any) {
        // This is a placeholder for actual Excel parsing logic
        // Implementation would depend on 'xlsx' or similar library
        console.log('Importing file:', file);
        return { message: 'Excel import simulated successfully', count: 0 };
    }
}
