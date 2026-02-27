// src/products/dto/update-product.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

// Comentario: PartialType hace que todos los campos de CreateProductDto sean opcionales para el UPDATE [cite: 2026-02-23]
export class UpdateProductDto extends PartialType(CreateProductDto) {}