import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
    constructor(private readonly jwtService: JwtService) {}

    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleAuth() {}

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    googleCallback(@Req() req: Request & { user: User }) {
        const user = req.user;
        const access_token = this.jwtService.sign({ sub: user.id, email: user.email });
        return {
            access_token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        };
    }
}