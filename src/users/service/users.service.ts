import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) { }

  // Crear un nuevo usuario
  async create(dto: CreateUserDto) {
    // Comentario: Encriptamos la contraseña antes de guardar [cite: 2026-02-20]
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const newUser = this.repo.create({
      ...dto,
      password: hashedPassword
    });
    return await this.repo.save(newUser);
  }

  // Obtener todos los usuarios
  findAll() {
    return this.repo.find();
  }

  // Obtener uno por ID
  async findOne(id: number) {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    // Si el DTO trae una nueva contraseña, la encriptamos
    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      dto.password = await bcrypt.hash(dto.password, salt);
    }

    // Comentario: Fusionamos los datos del DTO con la entidad encontrada [cite: 2026-02-23]
    Object.assign(user, dto);
    return this.repo.save(user);
  }

  // Eliminar usuario
  async remove(id: number) {
    const user = await this.findOne(id);
    return this.repo.remove(user);
  }

  // En users.service.ts
  async findOneByEmail(email: string) {
    return await this.repo.findOne({ where: { email } });
  }
}