import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get<string>('JWT_SECRET') || 'secret',
        });
        console.log('AtStrategy initialized with secret:', config.get<string>('JWT_SECRET'));
    }

    validate(payload: any) {
        console.log('AtStrategy: Validating payload:', payload);
        return {
            id: payload.sub,
            email: payload.email,
            ...payload
        };
    }
}
