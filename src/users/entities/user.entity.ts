import { UserDesign } from 'src/designs/entities/user-design.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';


export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Encriptada siempre

  @Column()
  nombre: string;

  @Column({
    type: 'varchar',
    default: UserRole.USER,
  })
  rol: UserRole;

  // Un usuario puede tener muchos diseños en su galería
  @OneToMany(() => UserDesign, (design) => design.usuario)
  designs: UserDesign[];

  @OneToMany(() => Order, (order) => order.usuario)
  pedidos: Order[];

}
