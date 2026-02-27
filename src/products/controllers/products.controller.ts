import { Controller, Get, Post, Body, Put, Delete, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ProductsService } from '../service/products.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { UpdateProductDto } from '../dto/update-product.dto';
import { SearchProductsDto } from '../dto/search-products.dto';

@ApiTags('Productos') // Comentario: Sección de catálogo y gestión de stock [cite: 2026-02-20]
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) { }

  @ApiOperation({ summary: 'Listar todos los productos', description: 'Retorna el catálogo completo de productos activos' })
  @ApiOkResponse({ description: 'Listado de productos recuperado con éxito' })
  @Get()
  async findAll() {
    return await this.service.findAll();
  }

  @ApiOperation({ summary: 'Obtener detalle de un producto', description: 'Retorna un producto con sus variantes (tallas/colores) para el configurador' })
  @ApiParam({ name: 'id', description: 'ID del producto base' })
  @ApiOkResponse({ description: 'Producto encontrado' })
  @ApiNotFoundResponse({ description: 'El producto no existe o está eliminado' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    // El controlador solo delega la responsabilidad al servicio
    return await this.service.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo producto (Solo Admin)' })
  @ApiCreatedResponse({ description: 'Producto creado correctamente' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() data: any) {
    return await this.service.crearProducto(data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar producto (Solo Admin)' })
  @ApiParam({ name: 'id', description: 'ID del producto a editar' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return await this.service.update(id, updateProductDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar producto (Solo Admin)', description: 'Realiza un borrado lógico (Soft Delete) para no romper pedidos antiguos' })
  @ApiParam({ name: 'id', description: 'ID del producto a eliminar' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.service.remove(id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscador avanzado con filtros y paginación' })
  async search(@Query() searchDto: SearchProductsDto) {
    // Comentario: Los Query Params se validan automáticamente gracias al DTO [cite: 2026-02-23]
    return await this.service.search(searchDto);
  }
}