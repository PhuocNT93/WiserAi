import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/client/client';

@Injectable()
export class RoleSkillMappingService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.RoleSkillMappingCreateInput) {
        return this.prisma.roleSkillMapping.create({ data });
    }

    async findAll() {
        try {
            return this.prisma.roleSkillMapping.findMany();
        } catch (error) {
             return {
                status: 500,
                message: `Can not fetch all rolle-skill mapping. Error detail :${error}`,
                data: []
            }
        }
    }

    async findOne(id: number) {
        return this.prisma.roleSkillMapping.findUnique({ where: { id } });
    }

    async update(id: number, data: Prisma.RoleSkillMappingUpdateInput) {
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
