import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateAuthDto, AuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role } from '../generated/client/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) { }

  async register(dto: CreateAuthDto) {
    const userExists = await this.usersService.findByEmail(dto.email);
    if (userExists) throw new ForbiddenException('User already exists');

    const hashedPassword = await this.hashData(dto.password);
    const newUser = await this.usersService.create({
      ...dto,
      password: hashedPassword,
    });

    const tokens = await this.getTokens(newUser.id, newUser.email, newUser.roles);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);
    return tokens;
  }

  async login(dto: AuthDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new ForbiddenException('Access Denied');

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email, user.roles);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: number) {
    // Invalidate refresh tokens for user (or specific token if we track it)
    // For simplicity, revoke all or just delete from DB if we track one per device.
    // Our schema allows multiple refresh tokens.
    // Here we might just want to delete the cookie or token from client, 
    // but in DB we should mark them revoked or delete.
    // For this implementation, let's delete all refresh tokens for the user or just updated `revoked` status?
    // The requirement says "Lưu refresh token đã mã hoá trong database".

    // Let's delete all active refresh tokens for the user for now to "Logout everywhere"
    // or just the current one if we had the refresh token passed.
    // Since logout usually comes with Access Token, we might not have the Refresh Token string unless passed.
    // We will just revoke all tokens for this user for simplicity in this MVP step, 
    // OR we could require passing the refresh token to revoke a specific one.

    // Let's assume logout means invalidating the current session. 
    // But without the RT passed, we can't key it.
    // Simplified: revoke all.
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revoked: false
      },
      data: { revoked: true },
    });
    return true;
  }

  async refreshTokens(userId: number, rt: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new ForbiddenException('Access Denied');

    // Find the token in DB
    // We need to match the stored hash or the token itself if stored plaintext.
    // Requirement says "Lưu refresh token đã mã hoá trong database".

    // So we iterate or find match. 
    // Actually, storing hashed RT means we can't find it easily unless we iterate 
    // OR we store a hash of the RT and compare.
    // Let's assume we store the hash.

    // But wait, if we have multiple, how do we find WHICH one to verify?
    // Usually we send a `deprecated` token or similar, or we just rely on the user having the token.
    // If we simply hash the RT and store it, we can't query by it directly if using bcrypt (salted).
    // So we should verify against all valid tokens for the user? That's expensive.
    // Alternatively, the RT payload (JWT) can contain a `jti` (tokenId) which handles the lookup.

    // Let's verify the RT first using JwtService.
    try {
      // This validates signature and expiration
      const decoded = this.jwtService.verify(rt, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Find stored token that matches (we need to compare hashes?)
      // To make this efficient, we can store the `jti` or just use the token string if encrypted reversibly.
      // But requirement says "hashed". 
      // Best practice: Store (id, hashedToken).
      // On refresh, we get `rt`. We verify signature. 
      // Then we check if this user has this token (hashed) in DB.

      // Since we can't search by hash, we usually just store it.
      // Wait, if we use bcrypt, we can't search.
      // So we need to store it in a way we can lookup?
      // Or we pass the `deviceId` or `tokeId`?
      // Let's keep it simple: Compare against all unrevoked tokens for user.

      const tokens = await this.prisma.refreshToken.findMany({
        where: { userId, revoked: false },
      });

      let matchedToken: (typeof tokens)[number] | null = null;
      for (const tokenRecord of tokens) {
        const isMatch = await bcrypt.compare(rt, tokenRecord.token);
        if (isMatch) {
          matchedToken = tokenRecord;
          break;
        }
      }

      if (!matchedToken) throw new ForbiddenException('Access Denied');

      // Rotate: Revoke used token, issue new one
      await this.prisma.refreshToken.update({
        where: { id: matchedToken.id },
        data: { revoked: true },
      });

      const newTokens = await this.getTokens(user.id, user.email, user.roles);
      await this.updateRefreshToken(user.id, newTokens.refreshToken);
      return newTokens;

    } catch (error) {
      throw new ForbiddenException('Access Denied');
    }
  }

  async updateRefreshToken(userId: number, rt: string) {
    const hash = await this.hashData(rt);
    const decoded = this.jwtService.decode(rt) as any;
    const expiresAt = new Date(decoded.exp * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: hash,
        expiresAt,
      },
    });
  }

  async hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getTokens(userId: number, email: string, roles: Role[]) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, roles },
        {
          secret: (() => {
            const s = this.configService.get<string>('JWT_SECRET');
            console.log('AuthService signing with secret:', s);
            return s;
          })(),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, roles },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }
}
