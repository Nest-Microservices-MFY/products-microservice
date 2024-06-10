import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }
  async create(createProductDto: CreateProductDto) {
    return await this.product.create({ data: createProductDto });
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;

    const totalRecords = await this.product.count({
      where: { available: true },
    });
    const lastPage = Math.ceil(totalRecords / limit);

    if (page > lastPage) {
      throw new NotFoundException(
        `Page ${page} not exist, last page is ${lastPage}`,
      );
    }

    return {
      metadata: {
        total: totalRecords,
        page: page,
        lastPage: lastPage,
      },
      data: await this.product.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          available: true,
        },
      }),
    };
  }

  async findAllDeletedProduct(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;

    const totalRecords = await this.product.count({
      where: { available: false },
    });
    const lastPage = Math.ceil(totalRecords / limit);

    if (page > lastPage) {
      throw new NotFoundException(
        `Page ${page} not exist, last page is ${lastPage}`,
      );
    }

    return {
      metadata: {
        total: totalRecords,
        page: page,
        lastPage: lastPage,
      },
      data: await this.product.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          available: false,
        },
      }),
    };
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: {
        id: id,
        available: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id: ${id} not found`);
    }

    return product;
  }

  async update(updateProductDto: UpdateProductDto) {
    const { id, ...data } = updateProductDto;

    await this.findOne(id);

    return await this.product.update({
      where: { id: id },
      data: data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    /* // Hard delete ---
    return {
      metadata: {
        message: `Product id: ${id} deleted`,
        date: new Date().toLocaleString(),
      },
      data: await this.product.delete({
        where: { id: id },
      }),
    }; */

    // Soft delete
    const product = await this.product.update({
      where: { id: id },
      data: {
        available: false,
      },
    });
    return product;
  }
}
