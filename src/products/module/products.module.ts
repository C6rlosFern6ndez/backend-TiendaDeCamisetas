// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductsController } from '../controllers/products.controller';
import { ProductVariantsService } from '../service/product-variants.service';
import { ProductVariantsController } from '../controllers/product-variants.controller';
import { ProductsService } from '../service/products.service';


@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductVariant])],
  controllers: [ProductsController, ProductVariantsController],
  providers: [ProductsService, ProductVariantsService], // Añadir aquí
  exports: [ProductsService, ProductVariantsService, TypeOrmModule]
})
export class ProductsModule {}