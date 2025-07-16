import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'tajnyklic', // stejné jako v JwtModule.register - ideálně z .env
    });
  }

  async validate(payload: any) {
    // Změň userId na id
    return { id: payload.sub, email: payload.email };
  }
}
