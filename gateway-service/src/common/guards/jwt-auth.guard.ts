import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader.startsWith('Bearer '))
      throw new UnauthorizedException('Missing token');

    const token = authHeader.split(' ')[1];
    try {
      const secret = this.config.get<string>('jwt.secret')!;
      try {
        const secret = this.config.get<string>('jwt.secret')!;
        const decoded = jwt.verify(token, secret);
        request.user = decoded;
        return true;
      } catch (err) {
        console.error('JWT verification failed:', err);
        throw new UnauthorizedException('Invalid token');
      }
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
