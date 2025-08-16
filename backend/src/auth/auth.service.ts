import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private jwt: JwtService) {}

  async register(email: string, password: string, name: string) {
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.userService.create(email, hashed, name);

    // Vygenerovat token po registraci (automatické přihlášení)
    const payload = { sub: user.id, email: user.email };
    const token = this.jwt.sign(payload);

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }

  async login(email: string, password: string) {
    console.log('🔍 AuthService.login called with:', { email, password }); // Debug log
    console.log('🔍 Email type:', typeof email); // Debug log

    if (!email) {
      throw new Error('Email is undefined or empty');
    }

    const user = await this.userService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwt.sign(payload);

    console.log('🎟️ Generated token:', token);
    console.log('🧑 Payload:', payload);

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async findUserById(id: string) {
    return this.userService.findOne(id);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password in database
    await this.userService.updatePassword(userId, hashedNewPassword);
    
    return { message: 'Password changed successfully' };
  }
}
