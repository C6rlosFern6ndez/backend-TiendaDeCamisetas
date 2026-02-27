// src/products/service/product-variants.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from '../entities/product-variant.entity';
import { CreateVariantDto } from '../dto/create-variant.dto';
import { UpdateVariantDto } from '../dto/update-variant.dto';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly repo: Repository<ProductVariant>,
  ) { }

  async create(dto: CreateVariantDto & { productId: number }) {
    // Comentario: Ahora pasamos objetos con ID para las relaciones 
    const variant = this.repo.create({
      stock: dto.stock,
      precioExtra: dto.precioExtra || 0,
      producto: { id: dto.productId }, // Relación con Product
      talla: { id: dto.tallaId },      // Relación con la entidad Size
      color: { id: dto.colorId }      // Relación con la entidad Color
    });

    return await this.repo.save(variant);
  }

  findAll() {
    // Gracias al 'eager: true' en la entidad, no necesitas añadir 'talla' y 'color' aquí
    return this.repo.find({ relations: ['producto'] });
  }

  async update(id: number, dto: UpdateVariantDto) {
    const variant = await this.repo.findOneBy({ id });
    if (!variant) throw new NotFoundException('Variante no encontrada');

    // Comentario: Fusionamos los cambios de forma segura
    Object.assign(variant, dto);
    return await this.repo.save(variant);
  }

  async remove(id: number) {
    const variant = await this.repo.findOneBy({ id });
    if (!variant) throw new NotFoundException('Variante no encontrada');
    return this.repo.remove(variant);
  }
}