import {
  Controller, Post, Get, Delete, Body, Param,
  UseGuards, UseInterceptors, UploadedFile, Req, ParseIntPipe,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { DesignsService } from '../service/designs.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse
} from '@nestjs/swagger';
import { CreateDesignDto } from '../dto/create-design.dto';

@ApiTags('Diseños') // Comentario: Gestión de imágenes y galería personalizada [cite: 2026-02-20]
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('designs')
export class DesignsController {

  constructor(private readonly designsService: DesignsService) { }

  @ApiOperation({ summary: 'Subir nuevo diseño', description: 'Sube una imagen, genera una miniatura y la guarda en la galería del usuario' })
  @ApiConsumes('multipart/form-data') // 🔥 IMPORTANTE: Indica a Swagger que es una subida de archivo
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' }, // Comentario: Define el campo de archivo en la UI [cite: 2026-02-20]
        nombre: { type: 'string' },
        esPublico: { type: 'boolean' },
      },
    },
  })

  @ApiOperation({ summary: 'Subir diseño personalizado', description: 'Permite subir imágenes en alta resolución (hasta 20MB) para personalización' })
  @ApiCreatedResponse({ description: 'Diseño procesado y guardado correctamente' })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/designs', // Comentario: Carpeta donde se guardarán físicamente los archivos [cite: 2026-02-23]
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `design-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      // Comentario: Validamos que solo se suban formatos compatibles con impresión [cite: 2026-02-20]
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new BadRequestException('Formato de imagen no permitido'), false);
      }
      cb(null, true);
    },
    // ✅ Cambio realizado: Incrementado a 20MB para soportar alta resolución (300 DPI) [cite: 2026-02-25]
    limits: { fileSize: 20 * 1024 * 1024 }
  }))

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { /* ... tu configuración de storage ... */ }))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDesignDto: CreateDesignDto, // ✅ Ahora validado
    @Req() req: any
  ) {
    if (!file) throw new BadRequestException('No se ha seleccionado archivo');

    // Comentario: El DTO ya filtró y transformó los datos aquí [cite: 2026-02-23]
    return await this.designsService.crear(req.user.id, createDesignDto, file.path);
  }

  @ApiOperation({ summary: 'Obtener mi galería personal' })
  @ApiOkResponse({ description: 'Lista de diseños creados por el usuario logueado' })
  @Get('my-gallery')
  async getMyGallery(@Req() req: any) {
    return await this.designsService.findAllByUser(req.user.id);
  }

  @ApiOperation({ summary: 'Ver diseños públicos de la comunidad' })
  @ApiOkResponse({ description: 'Lista de diseños marcados como públicos para la tienda' })
  @Get('public')
  async getPublicGallery() {
    return await this.designsService.findAllPublic();
  }

  @ApiOperation({ summary: 'Eliminar un diseño' })
  @ApiParam({ name: 'id', description: 'ID del diseño a eliminar' })
  @ApiOkResponse({ description: 'Registro y archivos físicos eliminados' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return await this.designsService.eliminar(id, req.user.id);
  }
}