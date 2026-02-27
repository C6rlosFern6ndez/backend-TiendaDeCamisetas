// src/products/dto/update-variant.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateVariantDto } from './create-variant.dto';

// Comentario: Al usar PartialType, heredamos las validaciones de CreateVariantDto pero como opcionales 
export class UpdateVariantDto extends PartialType(CreateVariantDto) {}