import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@tienda.com', description: 'Correo electrónico del usuario' }) // Comentario: Ejemplo para el Seeder 
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin1234', description: 'Contraseña de acceso' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}