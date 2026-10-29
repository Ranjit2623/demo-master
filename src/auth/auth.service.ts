
import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, timingSafeEqual } from 'crypto';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

interface RefreshPayload {
    sub: number;
    email: string;
}

@Injectable()
export class AuthService {
    private readonly refreshSecret: string;

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        configService: ConfigService,
    ) {
        this.refreshSecret =
            configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    }

    private hashToken(token: string): string {
        return createHash('sha256')
            .update(token)
            .digest('hex');
    }

    private hashesMatch(
        storedHash: string | null,
        token: string,
    ): boolean {
        if (!storedHash) {
            return false;
        }

        const stored = Buffer.from(storedHash, 'hex');
        const incoming = Buffer.from(this.hashToken(token), 'hex');

        return (
            stored.length === incoming.length &&
            timingSafeEqual(stored, incoming)
        );
    }

    private async createTokenPair(user: {
        id: number;
        email: string;
    }) {
        const payload = {
            sub: user.id,
            email: user.email,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, {
                secret: this.refreshSecret,
                expiresIn: 7 * 24 * 60 * 60,
            }),
        ]);

        // Store only a hash of the refresh token.
        await this.usersService.updateRefreshTokenHash(
            user.id,
            this.hashToken(refreshToken),
        );

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: 'Bearer',
            expires_in: 900,
            refresh_expires_in: 7 * 24 * 60 * 60,
        };
    }

    async login(dto: LoginDto) {
        const email = dto.email.trim().toLowerCase();
        const user = await this.usersService.findByEmail(email);

        if (
            !user ||
            !user.passwordHash ||
            !(await bcrypt.compare(dto.password, user.passwordHash))
        ) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const tokens = await this.createTokenPair(user);

        return {
            success: true,
            message: 'Login successful',
            ...tokens,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        };
    }

    async refresh(dto: RefreshTokenDto) {
        let payload: RefreshPayload;

        try {
            payload = await this.jwtService.verifyAsync<RefreshPayload>(
                dto.refreshToken,
                { secret: this.refreshSecret },
            );
        } catch {
            throw new UnauthorizedException(
                'Invalid or expired refresh token',
            );
        }

        if (
            !Number.isInteger(payload.sub) ||
            payload.sub <= 0 ||
            typeof payload.email !== 'string'
        ) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const user =
            await this.usersService.findByIdWithRefreshToken(payload.sub);

        if (
            !user ||
            user.email !== payload.email ||
            !this.hashesMatch(user.refreshTokenHash, dto.refreshToken)
        ) {
            throw new UnauthorizedException(
                'Invalid or revoked refresh token',
            );
        }

        // Rotation: save a new refresh-token hash.
        // The previous refresh token becomes invalid.
        const tokens = await this.createTokenPair(user);

        return {
            success: true,
            message: 'Token refreshed successfully',
            ...tokens,
        };
    }

    async logout(dto: RefreshTokenDto) {
        let payload: RefreshPayload;

        try {
            payload = await this.jwtService.verifyAsync<RefreshPayload>(
                dto.refreshToken,
                { secret: this.refreshSecret },
            );
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const user =
            await this.usersService.findByIdWithRefreshToken(payload.sub);

        if (
            !user ||
            user.email !== payload.email ||
            !this.hashesMatch(user.refreshTokenHash, dto.refreshToken)
        ) {
            throw new UnauthorizedException(
                'Invalid or revoked refresh token',
            );
        }

        await this.usersService.updateRefreshTokenHash(
            user.id,
            null,
        );

        return {
            success: true,
            message: 'Logged out successfully',
        };
    }
}

