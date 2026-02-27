import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'juan.perez@email.com' })
  @IsEmail({}, { message: 'El formato del email no es válido' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Mínimo 6 caracteres' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(2)
  nombre: string;

  @ApiProperty({ enum: UserRole, default: UserRole.USER, required: false })
  @IsEnum(UserRole)
  @IsOptional()
  // Comentario: Solo el Admin debería poder enviar este campo, pero lo definimos aquí para el servicio 
  rol?: UserRole;
}