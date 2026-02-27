import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static'; 
import { join } from 'path';

// Importación de Entidades
import { Product } from '../products/entities/product-variant.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Size } from '../products/entities/size.entity'; // ✅ Nueva
import { Color } from '../products/entities/color.entity'; // ✅ Nueva
import { UserDesign } from '../designs/entities/user-design.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

// Importación de Módulos
import { UsersModule } from '../users/module/users.module';
import { OrdersModule } from '../orders/module/orders.module';
import { ProductsModule } from '../products/module/products.module';
import { DesignsModule } from '../designs/module/designs.module';
import { AuthModule } from '../auth/module/auth.module';

// Importación de Seeds (Utilidades)
import { SeedsService } from '../common/seeds/seeds.service';
import { SeedsController } from '../common/seeds/seeds.controller';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // 1. Configuración global (.env)
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Configuración de Archivos Estáticos
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // 3. Rate Limiting (Protección contra spam)
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),

    // 4. Configuración de Base de Datos (MySQL)
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const password = configService.get<string>('DB_PASSWORD');
        if (password === undefined) {
          throw new Error('❌ FATAL ERROR: DB_PASSWORD no definido en .env');
        }

        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST') || 'localhost',
          port: parseInt(configService.get<string>('DB_PORT') || '3306'),
          username: configService.get<string>('DB_USERNAME') || 'root',
          password: password,
          database: configService.get<string>('DB_DATABASE') || 'tienda_camisetas',
          entities: [
            Product, 
            ProductVariant, 
            Size, // ✅ Añadida para sincronización
            Color, // ✅ Añadida para sincronización
            UserDesign, 
            User,      
            Order,  
            OrderItem,
          ],
          synchronize: configService.get<string>('NODE_ENV') !== 'production', 
        };
      },
    }),

    // Comentario: Registramos entidades también para uso directo en SeedsService
    TypeOrmModule.forFeature([User, Size, Color]),

    // 5. Módulos de la Aplicación
    UsersModule,
    OrdersModule,
    ProductsModule,
    DesignsModule,
    AuthModule,
  ],
  controllers: [
    SeedsController // ✅ Registramos el controlador para ejecutar semillas desde Swagger
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    SeedsService, // ✅ Registramos el servicio de inicialización
  ],
})
export class AppModule { }