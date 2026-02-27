import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@tienda.com', description: 'Correo electrónico del usuario' }) // Comentario: Ejemplo para el Seeder [cite: 2026-02-25]
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin1234', description: 'Contraseña de acceso' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}