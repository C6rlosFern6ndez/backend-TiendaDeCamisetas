import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UsersService } from '../service/users.service';
import { UsersController } from '../controllers/users.controller';


@Module({
  imports: [TypeOrmModule.forFeature([User])], // Importante para el repositorio
  providers: [UsersService],
  controllers: [UsersController], // ¡Aquí registramos el controlador!
  exports: [UsersService],
})
export class UsersModule {}