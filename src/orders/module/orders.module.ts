import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { ProductsModule } from 'src/products/module/products.module';
import { ProductVariant } from 'src/products/entities/product-variant.entity';
import { DesignsModule } from 'src/designs/module/designs.module';
import { OrdersController } from '../controllers/orders.controller';
import { OrdersService } from '../service/orders.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, ProductVariant]),
    ProductsModule,
    DesignsModule, 
    MailModule
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService, 
  ],
})
export class OrdersModule {}