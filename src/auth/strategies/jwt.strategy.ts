import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'default-secret',
    });
  }

  async validate(payload: { sub: number }) {
    console.log('JWT Validation payload:', payload);
    const user = await this.usersService.findById(payload.sub);
    console.log('User from DB:', user);
    if (!user) {
      console.error('User not found for ID:', payload.sub);
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}