import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { AuthJwtPayload } from './types/auth-jwtPaylod';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';
import { CurrentUser } from './types/currentUser';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch)
      throw new UnauthorizedException('Invalid Credentials');

    return user;
  }

  async login(userId: string) {
    // const payload:AuthJwtPayload = { sub: userId };
    // const accessToken = this.jwtService.sign(payload)
    // const refreshToken = this.jwtService.sign(payload, this.refreshTokenConfig);
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);

    return {
      userId,
      accessToken,
      refreshToken,
    };
  }

  // async generateTokens(userId: number) {
  //   const payload: AuthJwtPayload = { sub: userId };
  //   const [accessToken, refreshToken] = await Promise.all([
  //     this.jwtService.signAsync(payload),
  //     this.jwtService.signAsync(payload, this.refreshTokenConfig),
  //   ]);

  //   return {
  //     accessToken,
  //     refreshToken,
  //   };
  // }

  async generateTokens(userId: string) {
    const payload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      // Access token uses default JwtModule config
      this.jwtService.signAsync(payload),

      // Refresh token uses refresh config explicitly
      this.jwtService.signAsync(payload, {
        secret: this.refreshTokenConfig.secret,
        expiresIn: this.refreshTokenConfig.expiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  // async refreshToken(userId: number) {
  //    const { accessToken, refreshToken } = await this.generateTokens(userId);
  //   const hashedRefreshToken = await argon2.hash(refreshToken);
  //   await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);

  //   return {
  //     userId,
  //     accessToken,
  //     refreshToken,
  //   };
  // }

  async refreshToken(userId: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);

    // Hash & store refresh token in DB
    const hashedRefreshToken = await argon2.hash(refreshToken);
    // console.log('New hashed refresh token', hashedRefreshToken);

    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);

    return { userId, accessToken, refreshToken };
  }

  // async validateRefreshToken(userId: number, refreshToken: string){
  //   const user = await this.userService.getSingleUser(userId);
  //   if( !user || !user.hashed_refresh_token) throw new UnauthorizedException('Invalid refresh token');

  //   const isRefreshTokenMatch = await argon2.verify(user.hashed_refresh_token, refreshToken);
  //   if(!isRefreshTokenMatch) throw new UnauthorizedException('Invalid refresh token');

  //   return {userId: user.id}
  // }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.getSingleUser(userId);
    if (!user || !user.hashed_refresh_token)
      throw new UnauthorizedException('Invalid refresh token');

    // console.log('Stored hash', user.hashed_refresh_token);
    const isMatch = await argon2.verify(
      user.hashed_refresh_token,
      refreshToken,
    );
    if (!isMatch) throw new UnauthorizedException('Invalid refresh token');

    return { userId: user.id };
  }

  async logout(userId: string) {
    await this.userService.updateHashedRefreshToken(userId, null);

    return { message: 'Logged out successfully' };
  }

  async validateJwtUser(userId: string) {
    const user = await this.userService.getSingleUser(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const currentUser: CurrentUser = {
      id: user.id,
      role: user.role,
    };

    return currentUser;
  }
}
