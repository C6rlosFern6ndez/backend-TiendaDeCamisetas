import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { UsersService } from '../../users/service/users.service';
import { Throttle } from '@nestjs/throttler';
import { LoginDto } from '../dto/login.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiCreatedResponse, 
  ApiUnauthorizedResponse 
} from '@nestjs/swagger';
import { RegisterDto } from '../dto/register.dto';

@ApiTags('Autenticación') // Comentario: Sección para registro y acceso al sistema 
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
    ) { }

    @ApiOperation({ summary: 'Registrar un nuevo usuario' })
    @ApiCreatedResponse({ description: 'Usuario registrado con éxito' })
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        // Comentario: Delegamos la creación al servicio de usuarios 
        return this.usersService.create(registerDto);
    }

    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @ApiOperation({ summary: 'Iniciar sesión', description: 'Valida credenciales y retorna un token JWT' })
    @ApiCreatedResponse({ description: 'Login exitoso, devuelve el token access_token' })
    @ApiUnauthorizedResponse({ description: 'El correo o la contraseña son incorrectos' })
    @Post('login')
    async login(@Body() loginDto: LoginDto) { // ✅ Ahora usamos el DTO validado 
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Comentario: 'user' contiene el id y rol necesarios para generar el token 
        return this.authService.login(user);
    }
}