import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { UserSkillsService } from './user-skills.service';
import { CreateUserSkillDto } from './dto/create-user-skill.dto';
import { UpdateUserSkillDto } from './dto/update-user-skill.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../generated/client/client';
import type { Request } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('User Skills')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('user-skills')
export class UserSkillsController {
  constructor(private readonly userSkillsService: UserSkillsService) { }

  @ApiOperation({ summary: 'Add a new skill' })
  @Post()
  create(@Req() req: Request, @Body() createUserSkillDto: CreateUserSkillDto) {
    const user = req.user as any;
    return this.userSkillsService.create(user.sub, createUserSkillDto);
  }

  @ApiOperation({ summary: 'Get my skills' })
  @Get('my-skills')
  getMySkills(@Req() req: Request) {
    const user = req.user as any;
    return this.userSkillsService.findAllByUserId(user.sub);
  }

  @ApiOperation({ summary: 'Update a skill' })
  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() updateUserSkillDto: UpdateUserSkillDto) {
    const user = req.user as any;
    return this.userSkillsService.update(user.sub, +id, updateUserSkillDto);
  }

  @ApiOperation({ summary: 'Get all skills (HR/Manager)' })
  @Roles(Role.HR, Role.MANAGER)
  @Get()
  findAll() {
    return this.userSkillsService.findAll();
  }
}
