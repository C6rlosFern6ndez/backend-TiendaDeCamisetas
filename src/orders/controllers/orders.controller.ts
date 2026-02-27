import { Controller, Post, Body, UseGuards, Req, InternalServerErrorException, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { OrdersService } from '../service/orders.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UserRole } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Throttle } from '@nestjs/throttler';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';

@ApiTags('Pedidos') // Comentario: Agrupa todos los endpoints de pedidos en Swagger 
@ApiBearerAuth()    // Comentario: Indica que se requiere el token JWT para estos endpoints
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Crear un nuevo pedido', description: 'Registra un pedido con múltiples items y calcula el precio total' })
  @ApiCreatedResponse({ description: 'Pedido creado exitosamente' })
  @ApiBadRequestResponse({ description: 'Stock insuficiente o datos inválidos' })
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async crearPedido(
    @Req() req: any,
    @Body() createOrderDto: CreateOrderDto // ✅ NestJS validará toda la estructura anidada
  ) {
    const usuarioId = req.user.id;

    // Comentario: Pasamos solo el array de items que el servicio espera 
    return await this.ordersService.crearPedido(usuarioId, createOrderDto.items);
  }

  @ApiOperation({ summary: 'Listar todos los pedidos (Solo Admin)' })
  @ApiOkResponse({ description: 'Listado completo de pedidos para administración' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/todos')
  async obtenerTodosLosPedidos() {
    return await this.ordersService.findAll();
  }

  @ApiOperation({ summary: 'Obtener historial del usuario logueado' })
  @ApiOkResponse({ description: 'Lista de pedidos realizados por el cliente' })
  @UseGuards(AuthGuard('jwt'))
  @Get('mis-pedidos')
  async obtenerMisPedidos(@Req() req: any) {
    return await this.ordersService.findByUser(req.user.id);
  }

  @ApiOperation({ summary: 'Obtener detalle de un pedido específico' })
  @ApiParam({ name: 'id', description: 'ID del pedido' })
  @ApiOkResponse({ description: 'Detalle del pedido con sus productos y diseños' })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async obtenerDetalle(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return await this.ordersService.findOneSecure(id, req.user.id);
  }

  @ApiOperation({ summary: 'Cancelar un pedido (Solo si está PENDIENTE)' })
  @ApiParam({ name: 'id', description: 'ID del pedido a cancelar' })
  @ApiOkResponse({ description: 'Pedido cancelado y stock devuelto al inventario' })
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/cancelar')
  async cancelar(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return await this.ordersService.cancelarPedido(id, req.user.id);
  }

  @ApiOperation({ summary: 'Cambiar estado del pedido (Solo Admin)' })
  @ApiParam({ name: 'id', description: 'ID del pedido' })
  @ApiOkResponse({ description: 'Estado actualizado correctamente' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/estado')
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateOrderStatusDto
  ) {
    return await this.ordersService.actualizarEstado(id, updateStatusDto.estado);
  }

  @Get('admin/stats')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener estadísticas de ventas (Solo Admin)' })
  async obtenerEstadisticas() {
    return await this.ordersService.getStats();
  }
}