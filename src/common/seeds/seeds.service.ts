// src/common/seeds/seeds.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../users/entities/user.entity';
import { Size } from '../../products/entities/size.entity';
import { Color } from '../../products/entities/color.entity';

@Injectable()
export class SeedsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Size) private sizeRepo: Repository<Size>,
    @InjectRepository(Color) private colorRepo: Repository<Color>,
  ) {}

  async run() {
    //console.log('🌱 Iniciando Seeding...');

    // 1. Crear Admin Inicial
    const adminExists = await this.userRepo.findOne({ where: { email: 'admin@tienda.com' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin1234', 10);
      await this.userRepo.save(this.userRepo.create({
        nombre: 'Admin',
        email: 'admin@tienda.com',
        password: hashedPassword,
        rol: UserRole.ADMIN,
      }));
      //console.log('✅ Admin creado');
    }

    // 2. Crear Tallas
    const tallasBase = ['S', 'M', 'L', 'XL', 'XXL'];
    for (const nombre of tallasBase) {
      const existe = await this.sizeRepo.findOne({ where: { nombre } });
      if (!existe) {
        await this.sizeRepo.save(this.sizeRepo.create({ nombre }));
      }
    }
    //console.log('✅ Tallas inicializadas');

    // 3. Crear Colores
    const coloresBase = [
      { nombre: 'Blanco', codigoHex: '#FFFFFF' },
      { nombre: 'Negro', codigoHex: '#000000' },
      { nombre: 'Gris Melange', codigoHex: '#BEBEBE' },
      { nombre: 'Azul Marino', codigoHex: '#000080' },
    ];
    for (const c of coloresBase) {
      const existe = await this.colorRepo.findOne({ where: { nombre: c.nombre } });
      if (!existe) {
        await this.colorRepo.save(this.colorRepo.create(c));
      }
    }
    //console.log('✅ Colores inicializados');

    return { message: 'DB Seeded successfully' };
  }
}