import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get<string>('JWT_REFRESH_SECRET') || 'secret',
            passReqToCallback: true,
        });
    }

    validate(req: Request, payload: any) {
        const authorization = req.get('authorization');
        if (!authorization) throw new ForbiddenException('Refresh token malformed');
        const refreshToken = authorization.replace('Bearer', '').trim();
        return {
            ...payload,
            refreshToken,
        };
    }
}
