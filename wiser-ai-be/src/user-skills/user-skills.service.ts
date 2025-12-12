import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserSkillDto } from './dto/create-user-skill.dto';
import { UpdateUserSkillDto } from './dto/update-user-skill.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserSkillsService {
  constructor(private prisma: PrismaService) { }

  async create(userId: number, dto: CreateUserSkillDto) {
    return this.prisma.userSkill.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async findAllByUserId(userId: number) {
    return this.prisma.userSkill.findMany({
      where: { userId },
    });
  }

  // Admin/Manager/HR only
  async findAll() {
    return this.prisma.userSkill.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async update(userId: number, skillId: number, dto: UpdateUserSkillDto) {
    // Ensure skill belongs to user or user is admin (logic handled in controller or here)
    // For simplicity, we check ownership here unless we want admins to edit too.
    // Let's assume user edits their own.
    const skill = await this.prisma.userSkill.findUnique({ where: { id: skillId } });
    if (!skill || skill.userId !== userId) {
      throw new NotFoundException('Skill not found or access denied');
    }

    return this.prisma.userSkill.update({
      where: { id: skillId },
      data: dto,
    });
  }
}
