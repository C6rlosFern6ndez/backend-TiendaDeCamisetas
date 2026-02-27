import { IsNumber, IsInt, Min, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVariantDto {
  @ApiProperty({ example: 1, description: 'ID de la Talla (relación con Size)' }) // Comentario: Swagger ahora mostrará este campo 
  @IsInt()
  @IsPositive()
  tallaId: number;

  @ApiProperty({ example: 2, description: 'ID del Color (relación con Color)' })
  @IsInt()
  @IsPositive()
  colorId: number;

  @ApiProperty({ example: 100, description: 'Stock inicial de esta variante' })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 0.0, description: 'Precio adicional por esta variante (ej: XXL +2.00)', required: false })
  @IsNumber()
  @Min(0)
  precioExtra?: number;
}