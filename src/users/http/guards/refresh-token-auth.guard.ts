import { CACHE_MANAGER, CanActivate, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { ExecutionContext } from '@nestjs/common/interfaces/features/execution-context.interface';
import { env } from '~config/env.config';

@Injectable()
export class RefreshTokenAuthGuard implements CanActivate {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache, private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { refreshToken } = context.switchToHttp().getRequest().body;
        this.jwtService.verify(refreshToken, { secret: env.JWT.REFRESH_SECRET });
        return !(await this.cacheManager.get(refreshToken));
    }
}
