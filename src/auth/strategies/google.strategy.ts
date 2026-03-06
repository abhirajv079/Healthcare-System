import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions, VerifyCallback } from 'passport-google-oauth20';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
            scope: ['email', 'profile'],
        } as StrategyOptions);
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: { id: string; emails?: { value: string }[]; displayName?: string; photos?: { value: string }[] },
        done: VerifyCallback,
    ): Promise<void> {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from Google'), undefined);
        let user = await this.usersService.findByGoogleId(profile.id);
        if (!user) {
            user = await this.usersService.createFromGoogle({
                email,
                googleId: profile.id,
                name: profile.displayName ?? null,
                profileImageUrl: profile.photos?.[0]?.value ?? null,
            });
        }
        done(null, user);
    }
}