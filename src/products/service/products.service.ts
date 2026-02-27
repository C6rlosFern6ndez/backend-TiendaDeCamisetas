import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity'; // ✅ Importamos la entidad
import { CreateProductDto } from '../dto/create-product.dto';
import { CreateVariantDto } from '../dto/create-variant.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { SearchProductsDto } from '../dto/search-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    // ✅ Inyectamos formalmente el repo de variantes 
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) { }

  // Creamos el producto usando el DTO validado
  async crearProducto(dto: CreateProductDto) {
    const product = this.productRepo.create({
      ...dto,
      material: dto.nombre ? 'ALGODÓN' : 'POLIÉSTER', // Lógica de negocio 
    });
    return await this.productRepo.save(product);
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['variantes'], // Carga relaciones de golpe
    });

    if (!product) throw new NotFoundException(`Producto ${id} no encontrado`);
    return product;
  }

  findAll() {
    return this.productRepo.find({ relations: ['variantes'] });
  }

  // Cambiamos Partial<Product> por el DTO validado
  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);

    // Comentario: Fusionamos los cambios del DTO en la entidad encontrada
    Object.assign(product, dto);

    return await this.productRepo.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    return await this.productRepo.softDelete(id);
  }

  // ✅ Ahora addVariant usa el repositorio inyectado, no el manager 
  async addVariant(productId: number, dto: CreateVariantDto) {
    const producto = await this.findOne(productId);

    const nuevaVariante = this.variantRepo.create({
      ...dto,
      producto: producto,
    });

    return await this.variantRepo.save(nuevaVariante);
  }

  async getLowStockAlerts() {
    // ✅ Uso directo del repositorio especializado 
    return await this.variantRepo.find({
      where: { stock: LessThan(5) },
      relations: ['product'],
    });
  }

  async search(query: SearchProductsDto) {
    const { termino, categoriaId, precioMax, page = 1, limit = 10 } = query;

    // Comentario: Calculamos cuántos registros saltar para la paginación 
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepo.createQueryBuilder('producto')
      .leftJoinAndSelect('producto.categoria', 'categoria')
      .leftJoinAndSelect('producto.variantes', 'variantes');

    // Filtro por nombre o descripción
    if (termino) {
      queryBuilder.andWhere(
        '(producto.nombre ILIKE :termino OR producto.descripcion ILIKE :termino)',
        { termino: `%${termino}%` }
      );
    }

    // Filtro por categoría
    if (categoriaId) {
      queryBuilder.andWhere('categoria.id = :categoriaId', { categoriaId });
    }

    // Filtro por precio máximo
    if (precioMax) {
      queryBuilder.andWhere('producto.precioBase <= :precioMax', { precioMax });
    }

    // Comentario: Aplicamos paginación y ejecutamos 
    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      meta: {
        totalItems: total,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      }
    };
  }
}