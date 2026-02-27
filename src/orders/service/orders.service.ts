import { DataSource } from 'typeorm';
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { DesignsService } from '../../designs/service/designs.service';
import { OrderStatus } from '../enums/order-status.enum';
import { ItemCarritoDto } from '../dto/item-carrito.dto';
import { MailService } from 'src/mail/mail.service';

interface ItemCarrito {
  varianteId: number;
  disenoId: number;
  cantidad: number;
  esPublico: boolean;
  ubicaciones: string[];
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private itemRepo: Repository<OrderItem>,
    @InjectRepository(ProductVariant)
    private variantRepo: Repository<ProductVariant>,
    private designsService: DesignsService,
    private dataSource: DataSource,
    private readonly mailService: MailService,
  ) { }

  private readonly logger = new Logger(OrdersService.name);

  async findOne(id: number) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'usuario', 'items.variante', 'items.variante.producto', 'items.variante.talla', 'items.variante.color'],
    });

    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async crearPedido(usuarioId: number, datosItems: ItemCarritoDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalPedido = 0;
      const itemsParaGuardar: OrderItem[] = [];

      for (const item of datosItems) {
        // Buscamos la variante con sus relaciones para validar stock y mostrar alertas
        const variante = await queryRunner.manager.findOne(ProductVariant, {
          where: { id: item.varianteId },
          relations: ['producto', 'talla', 'color']
        });

        if (!variante) throw new NotFoundException(`Variante ID ${item.varianteId} no encontrada`);

        if (variante.stock < item.cantidad) {
          throw new BadRequestException(`Stock insuficiente para ${variante.producto.nombre}. Disponible: ${variante.stock}`);
        }

        // Descontamos stock solo una vez por item
        variante.stock -= item.cantidad;
        await queryRunner.manager.save(variante);

        if (variante.stock < 5) {
          console.warn(`⚠️ ALERTA: Stock bajo para ${variante.producto.nombre} (${variante.talla.nombre}). Quedan: ${variante.stock}`);
        }

        const precioFinal = this.designsService.calcularPrecioFinal(
          Number(variante.producto.precioBase) + Number(variante.precioExtra),
          item.ubicaciones,
          item.esPublico
        );

        const nuevoItem = queryRunner.manager.create(OrderItem, {
          cantidad: item.cantidad,
          precioUnitario: precioFinal,
          variante: variante,
          diseno: { id: item.disenoId } as any,
        });

        totalPedido += precioFinal * item.cantidad;
        itemsParaGuardar.push(nuevoItem);
      }

      const pedido = queryRunner.manager.create(Order, {
        total: totalPedido,
        usuario: { id: usuarioId } as any,
        estado: OrderStatus.PENDIENTE,
        fecha: new Date()
      });

      const pedidoGuardado = await queryRunner.manager.save(pedido);

      // CORRECCIÓN DEL ERROR:
      // Usamos el nombre de propiedad 'pedido' que es el estándar que definimos en la entidad
      for (const itemGuardar of itemsParaGuardar) {
        itemGuardar.pedido = pedidoGuardado; // Cambiado de .order a .pedido
        await queryRunner.manager.save(itemGuardar);
      }

      await queryRunner.commitTransaction();
      return pedidoGuardado;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Comentario: Métodos de consulta y gestión administrativa
  async findByUser(usuarioId: number) {
    return await this.orderRepo.find({
      where: { usuario: { id: usuarioId } },
      order: { fecha: 'DESC' }
    });
  }

  async findOneSecure(id: number, usuarioId: number) {
    const order = await this.orderRepo.findOne({
      where: { id, usuario: { id: usuarioId } },
      relations: ['items', 'items.variante', 'items.variante.producto'],
    });
    if (!order) throw new NotFoundException('Pedido no encontrado o acceso denegado');
    return order;
  }

  async cancelarPedido(id: number, usuarioId: number) {
    const pedido = await this.findOneSecure(id, usuarioId);

    if (pedido.estado !== OrderStatus.PENDIENTE) {
      throw new BadRequestException('Solo pedidos PENDIENTES pueden cancelarse');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of pedido.items) {
        const variante = await queryRunner.manager.findOneBy(ProductVariant, { id: item.variante.id });
        if (variante) {
          variante.stock += item.cantidad;
          await queryRunner.manager.save(variante);
        }
      }

      pedido.estado = OrderStatus.CANCELADO;
      await queryRunner.manager.save(pedido);

      await queryRunner.commitTransaction();
      return { mensaje: 'Pedido cancelado con éxito' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.orderRepo.find({
      relations: ['usuario', 'items', 'items.variante', 'items.variante.producto'],
      order: { fecha: 'DESC' }
    });
  }

  /**
   * Actualiza el estado de un pedido e integra la gestión de stock y notificaciones.
   */
  async actualizarEstado(id: number, nuevoEstado: OrderStatus) {
    this.logger.log(`Cambiando estado del pedido ${id} a ${nuevoEstado}`);

    // Comentario: Corregimos la sintaxis de las relaciones para que TypeORM cargue todo correctamente 
    const pedido = await this.orderRepo.findOne({
      where: { id },
      relations: {
        usuario: true,
        items: {
          variante: {
            producto: true,
            talla: true,
            color: true,
          },
        },
      },
    });

    if (!pedido) throw new NotFoundException('Pedido no encontrado');

    // 1. Máquina de Estados: Definimos transiciones legales 
    const transicionesValidas: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDIENTE]: [OrderStatus.PAGADO, OrderStatus.CANCELADO],
      [OrderStatus.PAGADO]: [OrderStatus.ENVIADO],
      [OrderStatus.ENVIADO]: [],
      [OrderStatus.CANCELADO]: [],
    };

    // Comentario: Validamos si el cambio de estado es posible según la lógica de negocio 
    if (!transicionesValidas[pedido.estado].includes(nuevoEstado)) {
      throw new BadRequestException(
        `Transición no permitida: No se puede pasar de ${pedido.estado} a ${nuevoEstado}`
      );
    }

    // 2. Lógica de Negocio: Gestión de Stock 
    // Comentario: Si el estado cambia a PAGADO, restamos los productos del almacén
    if (nuevoEstado === OrderStatus.PAGADO) {
      await this.descontarStock(pedido);
    }

    // 3. Persistencia del cambio de estado
    pedido.estado = nuevoEstado;
    const pedidoActualizado = await this.orderRepo.save(pedido);

    // 4. Envío de Notificación Real 
    if (pedidoActualizado.usuario?.email) {
      try {
        await this.mailService.enviarNotificacionEstado(
          pedidoActualizado.usuario.email,
          pedidoActualizado.usuario.nombre,
          pedidoActualizado.id,
          nuevoEstado,
        );
      } catch (error) {
        // Comentario: Registramos el fallo del mail pero permitimos que la API responda éxito 
        this.logger.error(`Error al enviar email para el pedido ${id}: ${error.message}`);
      }
    }

    return pedidoActualizado;
  }

  async getStats() {
    // 1. Ingresos y cantidad de pedidos exitosos 
    const statsGenerales = await this.orderRepo
      .createQueryBuilder('pedido')
      .select('SUM(pedido.total)', 'ingresosTotales')
      .addSelect('COUNT(pedido.id)', 'numeroPedidos')
      .where('pedido.estado IN (:...estados)', {
        estados: [OrderStatus.PAGADO, OrderStatus.ENVIADO]
      })
      .getRawOne();

    // 2. Top 5 Productos más vendidos 
    // Comentario: Agrupamos por producto y sumamos las cantidades vendidas 
    const topProductos = await this.itemRepo
      .createQueryBuilder('item')
      .leftJoin('item.variante', 'variante')
      .leftJoin('variante.producto', 'producto')
      .select('producto.nombre', 'nombre')
      .addSelect('SUM(item.cantidad)', 'vendidos')
      .groupBy('producto.id')
      .addGroupBy('producto.nombre')
      .orderBy('vendidos', 'DESC')
      .limit(5)
      .getRawMany(); // Comentario: Usamos getRawMany para obtener la lista de resultados 

    return {
      resumen: {
        ingresosTotales: parseFloat(statsGenerales.ingresosTotales || 0),
        totalPedidosExitosos: parseInt(statsGenerales.numeroPedidos || 0),
      },
      topVentas: topProductos.map(p => ({
        nombre: p.nombre,
        cantidad: parseInt(p.vendidos)
      }))
    };
  }


  /**
    * Método para descontar stock de las variantes una vez confirmado el pago.
    * ✅ Cambiado de 'pedidoId: number' a 'pedido: Order' para evitar re-consultar la BD. 
    */
  private async descontarStock(pedido: Order) {
    // Comentario: Como ya traemos las relaciones del findOne, solo iteramos 
    for (const item of pedido.items) {
      const variante = item.variante;

      // Comentario: Usamos los nombres de las relaciones para el log informativo 
      const nombreVariante = `${variante.producto.nombre} (${variante.talla.nombre} / ${variante.color.nombre})`;

      if (variante.stock < item.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para ${nombreVariante}. Disponible: ${variante.stock}, Solicitado: ${item.cantidad}`
        );
      }

      // Comentario: Restamos y guardamos la variante actualizada 
      variante.stock -= item.cantidad;
      await this.variantRepo.save(variante);

      this.logger.log(`📦 Stock actualizado: ${nombreVariante} ahora tiene ${variante.stock} unidades.`);
    }
  }
}