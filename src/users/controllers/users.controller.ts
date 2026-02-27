import { 
  Controller, Get, Post, Body, Param, Put, Delete, 
  UseGuards, Req, ForbiddenException 
} from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { Throttle } from '@nestjs/throttler';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBearerAuth, 
  ApiParam, 
  ApiOkResponse, 
  ApiCreatedResponse, 
  ApiForbiddenResponse 
} from '@nestjs/swagger';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@ApiTags('Usuarios') // Comentario: Categoría en la interfaz de Swagger 
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Registrar un nuevo usuario', description: 'Crea una cuenta de usuario. Por defecto el rol es USER.' })
  @ApiCreatedResponse({ description: 'Usuario creado correctamente' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) { 
    // Comentario: El registro es público para permitir nuevos clientes 
    return this.service.create(createUserDto); 
  }

  @ApiBearerAuth() // Comentario: Requiere token JWT en Swagger 
  @ApiOperation({ summary: 'Listar todos los usuarios (Solo Admin)' })
  @ApiOkResponse({ description: 'Lista completa de usuarios para gestión administrativa' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() { 
    return this.service.findAll(); 
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID numérico del usuario' })
  @ApiOkResponse({ description: 'Datos del perfil del usuario solicitado' })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) { 
    return this.service.findOne(+id); 
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar perfil de usuario', description: 'Solo el dueño de la cuenta o un Admin pueden realizar cambios.' })
  @ApiParam({ name: 'id', description: 'ID del usuario a modificar' })
  @ApiForbiddenResponse({ description: 'No tienes permiso para modificar este perfil' })
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto, 
    @Req() req: any 
  ) {
    // Comentario: Validación de propiedad o rol administrativo 
    if (req.user.rol !== UserRole.ADMIN && req.user.id !== +id) {
      throw new ForbiddenException('No tienes permiso para modificar este perfil');
    }

    if (req.user.rol !== UserRole.ADMIN) {
      delete updateUserDto.rol; // Comentario: Un usuario normal no puede subirse el rango solo 
    }

    return this.service.update(+id, updateUserDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un usuario (Solo Admin)' })
  @ApiParam({ name: 'id', description: 'ID del usuario a eliminar' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) { 
    return this.service.remove(+id); 
  }
}