import { IsString, IsNumber, IsOptional, IsPositive, MinLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateVariantDto } from './create-variant.dto'; // ✅ Importamos el DTO de variantes

export class CreateProductDto {
  @ApiProperty({ example: 'Camiseta Premium', description: 'Nombre del modelo de camiseta' })
  @IsString()
  @MinLength(3)
  nombre: string;

  @ApiProperty({ example: 19.99, description: 'Precio base sin personalización' })
  @IsNumber()
  @IsPositive()
  precioBase: number;

  @ApiProperty({ example: 'uploads/products/front.png', required: false })
  @IsString()
  @IsOptional()
  frenteUrl?: string;

  @ApiProperty({ example: 'uploads/products/back.png', required: false })
  @IsString()
  @IsOptional()
  detrasUrl?: string;

  @ApiProperty({ 
    type: [CreateVariantDto], 
    description: 'Lista de variantes (tallas/colores) para este producto' 
  })
  @IsArray()
  @ValidateNested({ each: true }) // Comentario: Valida cada variante dentro del array 
  @Type(() => CreateVariantDto)
  variants: CreateVariantDto[];
}