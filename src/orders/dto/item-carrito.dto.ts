import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsBoolean, IsPositive, IsString } from 'class-validator';

// Comentario: Exportamos la clase para que tanto el otro DTO como el Servicio la usen 
export class ItemCarritoDto {
  @ApiProperty({ example: 1, description: 'ID de la variante (talla/color)' })
  @IsInt()
  @IsPositive()
  varianteId: number;

  @ApiProperty({ example: 5, description: 'ID del diseño guardado' })
  @IsInt()
  @IsPositive()
  disenoId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  cantidad: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  esPublico: boolean;

  @ApiProperty({ example: ['pecho', 'espalda'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  ubicaciones: string[];
}