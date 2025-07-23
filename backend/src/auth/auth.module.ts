import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';  // Přidej tento import
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: 'tajnyklic', // -> použij ENV ve finále
      signOptions: { expiresIn: '7d' },
    }),
    UserModule,
  ],
  controllers: [AuthController],  // Přidej toto pole!
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
