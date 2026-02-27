import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tallas')
export class Size {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string; // Ej: 'S', 'M', 'L', 'XL' [cite: 2026-02-20]
}