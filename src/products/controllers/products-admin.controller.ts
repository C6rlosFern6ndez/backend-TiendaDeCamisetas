import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, Body, Param, ParseIntPipe, BadRequestException, Get, Patch } from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { UserDesign } from '../../designs/entities/user-design.entity';
import { ProductsService } from '../service/products.service';
import { FilesService } from '../../common/files.service';
import 'multer';
import { CreateProductDto } from '../dto/create-product.dto';
import { CreateVariantDto } from '../dto/create-variant.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

export const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
        return callback(new BadRequestException('Solo se permiten imágenes (jpg, jpeg, png, webp)'), false);
    }
    callback(null, true);
};

@Controller('admin/products')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class ProductsAdminController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly filesService: FilesService,
    ) { }

    @Post('upload-base')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'frente', maxCount: 1 },
        { name: 'detras', maxCount: 1 },
    ], {
        fileFilter: imageFileFilter, // Aplicamos el filtro aquí
        limits: { fileSize: 1024 * 1024 * 5 } // Límite de 5MB por seguridad
    }))
    async uploadBaseImages(@UploadedFiles() files: { frente?: Express.Multer.File[], detras?: Express.Multer.File[] }) {

        // 🛡️ VALIDACIÓN FLEXIBLE: Al menos debe haber una imagen
        if (!files.frente?.[0] && !files.detras?.[0]) {
            throw new BadRequestException('Debes subir al menos una imagen (frente o detras)');
        }

        // Procesamos solo si el archivo existe, si no, devolvemos null
        const frenteResult = files.frente?.[0]
            ? await this.filesService.saveAndOptimize(files.frente[0], 'bases')
            : null;

        const detrasResult = files.detras?.[0]
            ? await this.filesService.saveAndOptimize(files.detras[0], 'bases')
            : null;

        return {
            frente: frenteResult,
            detras: detrasResult
        };
    }

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async crear(
        @Body() createProductDto: CreateProductDto
    ) {
        // Comentario: Registra el producto final con sus precios y rutas de imagen 
        return await this.productsService.crearProducto(createProductDto);
    }

    @Post(':id/variants')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async crearVariante(
        @Param('id', ParseIntPipe) productId: number,
        @Body() dto: CreateVariantDto
    ) {
        // Comentario: Delegamos al servicio la creación de la variante 
        return await this.productsService.addVariant(productId, dto);
    }

    @Get('alerts/low-stock')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN) //
    async obtenerAlertasStock() {
        return await this.productsService.getLowStockAlerts();
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async actualizar(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductDto: UpdateProductDto // ✅ Usamos el DTO de actualización
    ) {
        // Comentario: Llama al servicio para actualizar solo los campos enviados 
        return await this.productsService.update(id, updateProductDto);
    }
}