import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateDesignDto {
  @ApiProperty({ example: 'Logo Camiseta' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Pecho', description: 'Ubicación del diseño' })
  @IsString()
  ubicacion: string;

  @ApiProperty({ example: 'Texto personalizado', required: false })
  @IsString()
  @IsOptional()
  textoOpcional?: string;

  @ApiProperty({ example: true, default: false })
  // Comentario: Convierte el string "true"/"false" del form-data a booleano real [cite: 2026-02-23]
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  esPublico?: boolean = false;
}