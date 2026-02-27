import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { UserDesign } from '../../designs/entities/user-design.entity';

@Entity('detalles_pedido')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number; // Precio calculado con descuento en ese momento

  @ManyToOne(() => Order, (order) => order.items) // Apuntamos explícitamente a la propiedad 'items'
  pedido: Order;

  @ManyToOne(() => ProductVariant)
  variante: ProductVariant; // La camiseta física (Talla/Color)

  @ManyToOne(() => UserDesign)
  diseno: UserDesign; // El diseño personalizado (Imagen/Ubicación)
}