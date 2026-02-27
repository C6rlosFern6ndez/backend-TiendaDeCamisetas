import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, parse } from 'path';
import sharp from 'sharp'; // Comentario: Asegúrate de tener instalado @types/sharp 

@Injectable()
export class FilesService {
  // Comentario: Definimos la ruta raíz de subidas fuera del método para reusarla 
  private readonly uploadRoot = join(process.cwd(), 'uploads');

  async saveAndOptimize(file: Express.Multer.File, folder: 'bases' | 'designs') {
    const targetFolder = join(this.uploadRoot, folder);
    const thumbFolder = join(this.uploadRoot, 'thumbnails');

    // Comentario: Asegurar que existen las carpetas necesarias 
    [targetFolder, thumbFolder].forEach(dir => {
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    });

    // Comentario: Generamos un nombre único para evitar colisiones 
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalExtension = parse(file.originalname).ext;
    const fileName = `${uniqueName}${originalExtension}`;
    const thumbName = `${uniqueName}.webp`;

    try {
      // 1. Guardar el archivo original (necesario para impresión de alta calidad)
      // Comentario: Escribimos el buffer del archivo en la carpeta destino 
      const originalFullPath = join(targetFolder, fileName);
      writeFileSync(originalFullPath, file.buffer);

      // 2. Generar miniatura optimizada con Sharp
      // Comentario: Convertimos a WebP para reducir peso en el frontend 
      const thumbFullPath = join(thumbFolder, thumbName);
      await sharp(file.buffer)
        .resize(500, 500, { fit: 'inside' })
        .webp({ quality: 80 })
        .toFile(thumbFullPath);

      // Comentario: Retornamos rutas relativas para guardar en la base de datos 
      return {
        original: `uploads/${folder}/${fileName}`,
        webp: `uploads/thumbnails/${thumbName}`
      };

    } catch (error) {
      console.error('Error al procesar archivo:', error);
      throw new InternalServerErrorException('No se pudo procesar la imagen');
    }
  }
}