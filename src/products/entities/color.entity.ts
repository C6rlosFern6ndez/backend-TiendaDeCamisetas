import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('colores')
export class Color {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string; // Ej: 'Blanco', 'Negro' [cite: 2026-02-20]

  @Column({ nullable: true })
  codigoHex: string; // Ej: '#FFFFFF' (útil para el Front) [cite: 2026-02-23]
}