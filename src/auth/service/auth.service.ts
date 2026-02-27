import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/service/users.service';
import { Roles } from '../decorators/roles.decorator';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    // Lógica para validar al usuario en el login
    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);

        if (!user || !(await bcrypt.compare(pass, user.password))) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const { password, ...result } = user;
        return result;
    }

    async login(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            rol: user.rol
        };

        Logger.log('Generando token para el payload:', payload);

        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(registerDto: RegisterDto) {
        // Delegamos la creación al servicio de usuarios
        // Recuerda que la encriptación con bcrypt ya la pusimos en UsersService.create
        return await this.usersService.create(registerDto);
    }
}