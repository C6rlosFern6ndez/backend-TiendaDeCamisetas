import { IsOptional, IsString, IsNumber, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchProductsDto {
  @ApiPropertyOptional({ description: 'Buscar por nombre o descripción' })
  @IsOptional()
  @IsString()
  termino?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID de categoría' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoriaId?: number;

  @ApiPropertyOptional({ description: 'Precio máximo' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  precioMax?: number;

  // --- PAGINACIÓN ---
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}