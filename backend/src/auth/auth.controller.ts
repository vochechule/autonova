import { Controller, Post, Body, Get, UseGuards, Req, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from '../user/dto/register.dto';
import { LoginDto } from '../user/dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.name);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    console.log('🔍 Login DTO received:', dto);
    console.log('🔍 Email from DTO:', dto.email);
    console.log('🔍 Password from DTO:', dto.password);
    
    return this.authService.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    console.log('🔐 Auth me endpoint called');
    console.log('🧑 Request user:', req.user);
    return this.authService.findUserById(req.user.id);
  }
}
