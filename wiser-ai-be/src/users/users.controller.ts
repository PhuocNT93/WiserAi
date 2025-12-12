import { Controller, Get, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ summary: 'Get current user profile' })
  @Get('profile')
  getProfile(@Req() req: Request) {
    const user = req.user as any;
    return this.usersService.findOne(user.sub);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @Patch('profile')
  updateProfile(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const user = req.user as any;
    return this.usersService.update(user.sub, updateUserDto);
  }
}
