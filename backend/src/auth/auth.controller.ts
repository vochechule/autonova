import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Request,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from '../user/dto/register.dto';
import { LoginDto } from '../user/dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      name: string;
      isDealer?: boolean;
      dealerTier?: string;
    },
  ) {
    const { email, password, name, isDealer, dealerTier } = body;
    return this.authService.register(
      email,
      password,
      name,
      isDealer,
      dealerTier,
    );
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.authService.findUserById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      throw new BadRequestException(
        'Current password and new password are required',
      );
    }

    if (newPassword.length < 6) {
      throw new BadRequestException(
        'New password must be at least 6 characters long',
      );
    }

    return this.authService.changePassword(
      req.user.id,
      currentPassword,
      newPassword,
    );
  }

  @Post('forgot-password')
  @UsePipes(new ValidationPipe({ transform: true }))
  async forgotPassword(@Body() body: { email: string }) {
    const { email } = body;
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  @UsePipes(new ValidationPipe({ transform: true }))
  async resetPassword(@Body() body: { token: string; password: string }) {
    const { token, password } = body;
    return this.authService.resetPassword(token, password);
  }
}
