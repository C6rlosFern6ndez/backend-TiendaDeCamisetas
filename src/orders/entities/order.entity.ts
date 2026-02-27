import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { User } from 'src/users/entities/user.entity';

@Entity('pedidos')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  fecha: Date; // Se llena sola al crear el pedido

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDIENTE,
  })
  estado: OrderStatus;

  @ManyToOne(() => User, (user) => user.id) // Comentario: Añadimos la referencia al campo id del usuario [cite: 2026-02-20]
  usuario: User;

  @OneToMany(() => OrderItem, (item) => item.pedido)
  items: OrderItem[];
}