// src/products/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { DeleteDateColumn } from 'typeorm';

@Entity('productos')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string; // Ej: "Camiseta Premium Ajustada"

  @Column({ type: 'text' })
  descripcion: string; // Para el texto que se ve abajo

  @Column()
  material: string; // Ej: "100% Algodón"

  @Column()
  urlImagenDelante: string; // Foto de la camiseta blanca vacía de frente

  @Column()
  urlImagenDetras: string;  // Foto de la camiseta blanca vacía de espalda

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioBase: number;

  @OneToMany(() => ProductVariant, (variant) => variant.producto)
  variantes: ProductVariant[];

  @DeleteDateColumn()
  deletedAt: Date;
}