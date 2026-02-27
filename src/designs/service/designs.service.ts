import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp'; // Comentario: Importación corregida para evitar errores de tipo [cite: 2026-02-25]
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderItem } from '../../orders/entities/order-item.entity'; // Comentario: Asegúrate de que la ruta sea correcta según tu carpeta
import { UserDesign } from '../entities/user-design.entity';
import { CreateDesignDto } from '../dto/create-design.dto';

@Injectable()
export class DesignsService {
  private readonly PRECIO_EXTRA_UBICACION = 5.0;
  private readonly DESCUENTO_PUBLICO = 0.10;
  private readonly LIMITE_PRIVADOS = 5;

  constructor(
    @InjectRepository(UserDesign)
    private readonly repo: Repository<UserDesign>,
    private dataSource: DataSource, // Comentario: DataSource inyectado correctamente para consultas externas [cite: 2026-02-23]
  ) { }

  /**
   * Calcula el precio final según ubicación y visibilidad
   */
  calcularPrecioFinal(precioBase: number, ubicaciones: string[], esPublico: boolean): number {
    let precioTotal = Number(precioBase);

    if (ubicaciones.length > 1) {
      const cantidadExtras = ubicaciones.length - 1;
      precioTotal += (cantidadExtras * this.PRECIO_EXTRA_UBICACION);
    }

    if (esPublico) {
      precioTotal = precioTotal * (1 - this.DESCUENTO_PUBLICO);
    }

    return parseFloat(precioTotal.toFixed(2));
  }

  /**
   * Crea un diseño: Guarda el original y crea la miniatura WebP
   */
  async crear(userId: number, dto: CreateDesignDto, rutaArchivoOriginal: string) {
    // Comentario: Definimos las rutas arriba para que sean accesibles en el 'try' y en el 'catch' [cite: 2026-02-23]
    const folderThumb = './uploads/thumbnails';
    const nombreBase = path.parse(rutaArchivoOriginal).name;
    const rutaThumbnail = path.join(folderThumb, `${nombreBase}.webp`);

    // Asegurar que la carpeta existe
    if (!fs.existsSync(folderThumb)) {
      fs.mkdirSync(folderThumb, { recursive: true });
    }

    try {
      // Comentario: Generación de miniatura [cite: 2026-02-25]
      await sharp(rutaArchivoOriginal)
        .resize(400, 400, { fit: 'inside' })
        .webp({ quality: 80 })
        .toFile(rutaThumbnail); // ✅ Ahora sí reconoce la variable

      if (!dto.esPublico) {
        const cuentaPrivados = await this.repo.count({
          where: { usuarioId: userId, esPublico: false }
        });

        if (cuentaPrivados >= this.LIMITE_PRIVADOS) {
          this.limpiarArchivos([rutaArchivoOriginal, rutaThumbnail]); // ✅ Reconocida
          throw new BadRequestException(`Límite alcanzado: Máximo ${this.LIMITE_PRIVADOS} diseños privados.`);
        }
      }

      // Comentario: El precio base debería venir de una configuración centralizada en el futuro
      const precioBase = 15.0;
      const precioFinal = this.calcularPrecioFinal(precioBase, [dto.ubicacion], !!dto.esPublico);

      const nuevoDiseño = this.repo.create({
        ...dto,
        urlImagen: rutaArchivoOriginal,
        urlThumbnail: rutaThumbnail, // ✅ Reconocida
        precioFinalCalculado: precioFinal,
        usuarioId: userId,
      });

      return await this.repo.save(nuevoDiseño);

    } catch (error) {
      // Comentario: Si algo falla, borramos los archivos físicos para no dejar basura [cite: 2026-02-23]
      this.limpiarArchivos([rutaArchivoOriginal, rutaThumbnail]); // ✅ Reconocida
      throw error;
    }
  }

  async eliminar(id: number, userId: number) {
    const diseño = await this.repo.findOne({ where: { id, usuarioId: userId } });
    if (!diseño) throw new NotFoundException('Diseño no encontrado.');
    this.limpiarArchivos([diseño.urlImagen, diseño.urlThumbnail]);
    return await this.repo.remove(diseño);
  }

  private limpiarArchivos(rutas: string[]) {
    rutas.forEach(ruta => {
      if (ruta && fs.existsSync(ruta)) {
        try {
          fs.unlinkSync(ruta);
        } catch (err) {
          console.error(`Error borrando archivo: ${ruta}`, err);
        }
      }
    });
  }

  async findAllByUser(userId: number) {
    return await this.repo.find({ where: { usuarioId: userId } });
  }

  async findAllPublic() {
    return await this.repo.find({ where: { esPublico: true } });
  }

  /**
   * Tarea programada: Limpia diseños públicos obsoletos [cite: 2026-02-20]
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async limpiarDisenosPublicosObsoletos() {
    //console.log('🧹 Iniciando limpieza de diseños públicos...');

    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);

    // CORRECCIÓN: Usamos 'createdAt' que es el estándar de TypeORM para fechas automáticas
    const disenosAntiguos = await this.repo.find({
      where: {
        esPublico: true,
        createdAt: LessThan(fechaLimite) // Comentario: Asegúrate que tu entidad tenga @CreateDateColumn() createdAt: Date; [cite: 2026-02-23]
      }
    });

    for (const diseno of disenosAntiguos) {
      const usadoEnPedido = await this.dataSource.getRepository(OrderItem).findOne({
        where: { diseno: { id: diseno.id } }
      });

      if (!usadoEnPedido) {
       //console.log(`🗑️ Eliminando diseño público no vendido: ${diseno.nombre}`);
        this.limpiarArchivos([diseno.urlImagen, diseno.urlThumbnail]);
        await this.repo.remove(diseno);
      }
    }
    //console.log('✅ Limpieza completada.');
  }
}