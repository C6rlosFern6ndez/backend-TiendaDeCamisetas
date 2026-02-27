import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product.entity';
import { Size } from './size.entity'; // ✅ Importamos Size
import { Color } from './color.entity'; // ✅ Importamos Color

@Entity('producto_variantes')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  precioExtra: number; // Comentario: Por si una XXL cuesta más 

  // Relación con el Producto Base
  @ManyToOne(() => Product, (product) => product.variantes, { onDelete: 'CASCADE' })
  producto: Product;

  // ✅ Relación con Talla (Muchos variantes tienen una talla)
  @ManyToOne(() => Size, { eager: true }) // eager: true carga el nombre de la talla automáticamente
  talla: Size;

  // ✅ Relación con Color
  @ManyToOne(() => Color, { eager: true })
  color: Color;
}

export { Product };
