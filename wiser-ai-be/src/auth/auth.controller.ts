import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, AuthDto } from './dto/create-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @ApiOperation({ summary: 'Register new user' })
  @Post('signup')
  signup(@Body() dto: CreateAuthDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Login user' })
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request) {
    const user = req.user as any;
    return this.authService.logout(user.sub);
  }

  @ApiOperation({ summary: 'Forgot Password (Mock)' })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body('email') email: string) {
    // Mock logic
    return { message: `Reset link sent to ${email} (Mock)` };
  }

  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@Req() req: Request) {
    const user = req.user as any;
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }
}
