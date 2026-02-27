import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  CreateDateColumn // ✅ Importa esto
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('disenos_usuario')
export class UserDesign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  urlImagen: string;

  @Column({ nullable: true })
  urlThumbnail: string; 

  @Column({ nullable: true })
  textoOpcional: string;

  @Column()
  ubicacion: string;

  @Column({ default: false })
  esPublico: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioFinalCalculado: number;

  @Column()
  usuarioId: number;

  // ✅ Añade esta columna para que el Cron Job funcione
  @CreateDateColumn()
  createdAt: Date; 

  @ManyToOne(() => User, (user) => user.designs)
  usuario: User;
}