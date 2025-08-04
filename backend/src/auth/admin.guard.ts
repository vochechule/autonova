import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    console.log('All headers:', request.headers); // Debug všech headers
    console.log('Authorization header:', request.headers.authorization); // Debug auth header
    
    const token = request.headers.authorization?.split(' ')[1];
    
    console.log('Token received:', token ? 'Yes' : 'No');
    console.log('Token value:', token); // Debug samotný token

    if (!token) {
      throw new ForbiddenException('Token not provided');
    }

    try {
      const payload = this.jwtService.verify(token);
      console.log('JWT payload:', payload); // Přesunuto za definici payload
      
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, name: true, role: true }
      });

      console.log('User found:', user); // Přesunuto za definici user

      if (!user || user.role !== 'ADMIN') {
        console.log('Access denied - user role:', user?.role); // Dodatečný debug
        throw new ForbiddenException('Admin access required');
      }

      request.user = user;
      return true;
    } catch (error) {
      console.log('Guard error:', error.message); // Dodatečný debug
      throw new ForbiddenException('Invalid token or insufficient permissions');
    }
  }
}