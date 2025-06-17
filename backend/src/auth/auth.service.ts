import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private jwt: JwtService) {}

  async register(email: string, password: string, name: string) {
    const hashed = await bcrypt.hash(password, 10);
    return this.userService.createUser(email, hashed, name);
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    return { access_token: this.jwt.sign(payload) };
  }
}
