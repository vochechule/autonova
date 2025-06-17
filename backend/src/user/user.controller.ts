import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return req.user; // data z tokenu (userId, email)
  }
}
