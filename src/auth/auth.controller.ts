import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth/local-auth.guard';
import { RefreshJwtAuthGuard } from './guard/refresh-jwt-auth/refresh-jwt-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth/jwt-auth.guard';
import { Public } from './decorators/public.decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user.id);
  }

  @Public()
  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh-token')
  refreshToken(@Request() req) {
    const userId = req.user.userId;
    return this.authService.refreshToken(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req) {
    const userId = req.user.userId;
    return this.authService.logout(userId);
  }
}
