// src/products/product-variants.controller.ts
import { Controller, Post, Body, Get, Put, Delete, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProductVariantsService } from '../service/product-variants.service';
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
  ApiCreatedResponse 
} from '@nestjs/swagger';
import { UpdateVariantDto } from '../dto/update-variant.dto';

@ApiTags('Variantes de Producto') // Comentario: Sección para gestionar Tallas, Colores y Stock 
@Controller('product-variants')
export class ProductVariantsController {
  // Comentario: Cumplimos el patrón inyectando solo el Servicio 
  constructor(private readonly service: ProductVariantsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva variante (Solo Admin)', description: 'Asocia una combinación de talla, color y stock a un producto existente' })
  @ApiCreatedResponse({ description: 'Variante creada con éxito' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() data: any) {
    return await this.service.create(data);
  }

  @ApiOperation({ summary: 'Listar todas las variantes', description: 'Útil para ver disponibilidad global de stock' })
  @ApiOkResponse({ description: 'Listado de variantes recuperado' })
  @Get()
  async findAll() {
    return await this.service.findAll();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar variante (Solo Admin)', description: 'Permite modificar el stock, precio extra o disponibilidad' })
  @ApiParam({ name: 'id', description: 'ID de la variante física' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateVariantDto: UpdateVariantDto) {
    return await this.service.update(id, updateVariantDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar variante (Solo Admin)' })
  @ApiParam({ name: 'id', description: 'ID de la variante a eliminar' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.service.remove(id);
  }
}