import { Injectable } from '@nestjs/common';
import { CreateConfigDatumDto } from './dto/create-config-datum.dto';
import { UpdateConfigDatumDto } from './dto/update-config-datum.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfigDataService {
  constructor(private prisma: PrismaService) { }

  create(createConfigDatumDto: CreateConfigDatumDto) {
    return this.prisma.configData.create({
      data: createConfigDatumDto
    });
  }

  findAll() {
    return this.prisma.configData.findMany();
  }

  update(id: number, updateConfigDatumDto: UpdateConfigDatumDto) {
    return this.prisma.configData.update({
      where: { id },
      data: updateConfigDatumDto
    });
  }

  remove(id: number) {
    return this.prisma.configData.delete({ where: { id } });
  }
}
