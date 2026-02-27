import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        const secret = configService.get<string>('JWT_SECRET');

        // Si la clave no existe, lanzamos un error inmediatamente
        if (!secret) {
            throw new Error('❌ FATAL ERROR: JWT_SECRET no está definido en el archivo .env');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret, // Usamos la variable segura
        });
    }

    async validate(payload: any) {
        Logger.log('Contenido real del payload del token:', payload);

        return {
            // Intentamos pillar 'sub' (estándar) o 'id' por si acaso
            id: payload.sub || payload.id,
            email: payload.email,
            rol: payload.rol
        };
    }
}