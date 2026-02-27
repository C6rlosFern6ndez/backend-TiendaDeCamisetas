import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe, Logger } from '@nestjs/common'; // Comentario: Añadimos Logger para un rastro profesional 
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import { join } from 'path';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Comentario: Instanciamos el Logger antes de la app para capturar el arranque 
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Configurar el puerto desde el archivo .env 
  const port = process.env.PORT || 3000;

  // 2. Crear estructura de carpetas de subida si no existen 
  const folders = [
    join(process.cwd(), 'uploads/bases'),
    join(process.cwd(), 'uploads/designs'),
    join(process.cwd(), 'uploads/thumbnails'),
  ];

  folders.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // 3. Configurar el pipe de validación global para los DTOs 
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 4. Servir archivos estáticos para que las imágenes sean accesibles vía URL 
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // 5. Habilitar CORS para permitir peticiones solo desde tu Frontend local 
  // Comentario: En producción, cambia '*' por la URL real de tu Frontend por seguridad 
  app.enableCors({
    // Comentario: Aquí ponemos la URL exacta donde corre tu Frontend (normalmente Vite usa 5173) 
    origin: [
      'http://localhost:5173', // URL por defecto de Vite
      'http://localhost:3000', // Por si usas Next.js o similar
      'http://127.0.0.1:5173'  // A veces el navegador usa la IP en lugar de la palabra localhost
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Comentario: Permitimos el envío de cookies o cabeceras de autorización 
  });

  // 6. Interceptor global para seguridad de datos
  app.useGlobalInterceptors(new TransformInterceptor());

  // 📖 CONFIGURACIÓN SWAGGER 
  const config = new DocumentBuilder()
    .setTitle('API Tienda de Camisetas')
    .setDescription('Documentación oficial de los endpoints del sistema')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Comentario: Usamos el logger en lugar de console.log para el cierre del proceso 
  await app.listen(port);
  logger.log(`🚀 Servidor corriendo en: http://localhost:${port}`);
  logger.log(`📖 Swagger docs en: http://localhost:${port}/api/docs`);
}
bootstrap();