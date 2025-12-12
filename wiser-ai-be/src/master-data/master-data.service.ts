import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/client/client';

@Injectable()
export class MasterDataService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.MasterDataCreateInput) {
        return this.prisma.masterData.create({ data });
    }

    async findAll() {
        return this.prisma.masterData.findMany();
    }

    async findOne(id: number) {
        return this.prisma.masterData.findUnique({ where: { id } });
    }

    async update(id: number, data: Prisma.MasterDataUpdateInput) {
        return this.prisma.masterData.update({ where: { id }, data });
    }

    async remove(id: number) {
        return this.prisma.masterData.delete({ where: { id } });
    }

    async importFromExcel(file: any) {
        // This is a placeholder for actual Excel parsing logic
        // Implementation would depend on 'xlsx' or similar library
        console.log('Importing file:', file);
        return { message: 'Excel import simulated successfully', count: 0 };
    }
}
