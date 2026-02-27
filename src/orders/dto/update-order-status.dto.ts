import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({ 
    enum: OrderStatus, 
    example: OrderStatus.PAGADO,
    description: 'Nuevo estado del pedido' 
  })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  estado: OrderStatus;
}