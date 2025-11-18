import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import { AuthJwtPayload } from '../types/auth-jwtPaylod';
import { Inject, Injectable } from '@nestjs/common';
import refreshJwtConfig from '../config/refresh-jwt.config';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refrshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    private authService: AuthService,
  ) {
    if (!refrshJwtConfiguration.secret) {
      throw new Error('JWT secret is not defined in configuration.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: refrshJwtConfiguration.secret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: AuthJwtPayload) {
    const refreshToken = req.headers.authorization
      ?.replace('Bearer ', '')
      .trim();
    const userId = payload.sub;
    // console.log(userId, 'userId');

    if (!refreshToken) {
      throw new Error(
        'Refresh token is missing from the Authorization header.',
      );
    }

    return this.authService.validateRefreshToken(userId, refreshToken);
  }
}
