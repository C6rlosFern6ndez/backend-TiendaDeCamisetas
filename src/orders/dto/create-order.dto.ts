import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ItemCarritoDto } from './item-carrito.dto'; // ✅ Importación clara

export class CreateOrderDto {
  @ApiProperty({ type: [ItemCarritoDto], description: 'Lista de productos' })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ItemCarritoDto) // Comentario: Clase necesaria para que class-transformer sepa cómo validar [cite: 2026-02-23]
  items: ItemCarritoDto[];
}