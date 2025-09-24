import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private jwt: JwtService) {}

  async register(email: string, password: string, name: string, isDealer?: boolean, dealerTier?: string) {
    // ✅ Input validation
    if (!email || !email.includes('@')) {
      throw new BadRequestException({
        code: 'INVALID_EMAIL',
        message: 'Neplatný formát emailu'
      });
    }

    if (!name || name.trim().length < 2) {
      throw new BadRequestException({
        code: 'INVALID_NAME',
        message: 'Jméno musí mít alespoň 2 znaky'
      });
    }

    if (!password || password.length < 8) {
      throw new BadRequestException({
        code: 'PASSWORD_TOO_SHORT',
        message: 'Heslo musí mít alespoň 8 znaků'
      });
    }

    // ✅ Check if email already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Email se již používá'
      });
    }

    try {
      const hashed = await bcrypt.hash(password, 10);
      
      // ✅ PŘIDÁNO - Dealer registrace s tier
      const userData: any = {
        email,
        password: hashed,
        name: name.trim(),
        isDealer: Boolean(isDealer),
      };

      // Pokud je dealer, nastav tier (defaultně BASIC)
      if (isDealer) {
        const validTiers = ['BASIC', 'PREMIUM', 'ENTERPRISE'];
        // ✅ OPRAVENO - Přidej type guard a default hodnotu
        const tierToCheck = dealerTier?.toUpperCase() || 'BASIC';
        userData.dealerTier = validTiers.includes(tierToCheck) 
          ? tierToCheck 
          : 'BASIC';
        userData.tierUpgradedAt = new Date();
      }

      const user = await this.userService.create(userData);

      // Vygenerovat token po registraci (automatické přihlášení)
      const payload = { 
        sub: user.id, 
        email: user.email,
        role: user.role,
        isDealer: user.isDealer,
        dealerTier: user.dealerTier
      };
      const token = this.jwt.sign(payload);

      return {
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name,
          isDealer: user.isDealer,
          dealerTier: user.dealerTier
        },
        token,
      };
    } catch (error) {
      // ✅ Handle Prisma unique constraint errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException({
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'Email se již používá'
          });
        }
      }
      
      console.error('Registration error:', error);
      throw new BadRequestException({
        code: 'REGISTRATION_FAILED',
        message: 'Registrace se nezdařila'
      });
    }
  }

  async login(email: string, password: string) {
    // ✅ Input validation
    if (!email) {
      throw new BadRequestException({
        code: 'INVALID_EMAIL',
        message: 'Email je povinný'
      });
    }

    if (!password) {
      throw new BadRequestException({
        code: 'INVALID_PASSWORD',
        message: 'Heslo je povinné'
      });
    }

    try {
      const user = await this.userService.findByEmail(email);
      
      if (!user) {
        throw new UnauthorizedException({
          code: 'INVALID_CREDENTIALS',
          message: 'Neplatný email nebo heslo'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException({
          code: 'INVALID_CREDENTIALS',
          message: 'Neplatný email nebo heslo'
        });
      }

      const payload = { sub: user.id, email: user.email };
      const token = this.jwt.sign(payload);

      return {
        token,
        user: { id: user.id, email: user.email, name: user.name },
      };
    } catch (error) {
      // ✅ Re-throw known errors
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      
      console.error('Login error:', error);
      throw new UnauthorizedException({
        code: 'LOGIN_FAILED',
        message: 'Přihlášení se nezdařilo'
      });
    }
  }

  async findUserById(id: string) {
    return this.userService.findOne(id);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // ✅ Input validation
    if (!currentPassword) {
      throw new BadRequestException({
        code: 'CURRENT_PASSWORD_REQUIRED',
        message: 'Současné heslo je povinné'
      });
    }

    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException({
        code: 'PASSWORD_TOO_SHORT',
        message: 'Nové heslo musí mít alespoň 8 znaků'
      });
    }

    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new UnauthorizedException({
          code: 'USER_NOT_FOUND',
          message: 'Uživatel nebyl nalezen'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException({
          code: 'INVALID_CURRENT_PASSWORD',
          message: 'Současné heslo není správné'
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password in database
      await this.userService.updatePassword(userId, hashedNewPassword);
      
      return { message: 'Heslo bylo úspěšně změněno' };
    } catch (error) {
      // ✅ Re-throw known errors
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      
      console.error('Change password error:', error);
      throw new BadRequestException({
        code: 'PASSWORD_CHANGE_FAILED',
        message: 'Změna hesla se nezdařila'
      });
    }
  }
}
