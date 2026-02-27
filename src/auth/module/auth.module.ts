import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importamos ConfigService
import { AuthService } from '../service/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { UsersModule } from 'src/users/module/users.module';
import { JwtStrategy } from '../jwt.strategy';


@Module({
  imports: [
    UsersModule,
    PassportModule,
    // Usamos registerAsync para esperar a que cargue el .env
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          // Forzamos el tipo para que acepte el string del .env sin errores
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '1h') as any,
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule { }