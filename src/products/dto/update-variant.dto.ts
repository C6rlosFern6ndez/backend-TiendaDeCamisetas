// src/products/dto/update-variant.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateVariantDto } from './create-variant.dto';

// Comentario: Al usar PartialType, heredamos las validaciones de CreateVariantDto pero como opcionales [cite: 2026-02-23]
export class UpdateVariantDto extends PartialType(CreateVariantDto) {}