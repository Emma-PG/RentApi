import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ProductService } from './products.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @Post()
  async addProduct(
    @Body() completeBody: { title: string; description: string; price: number },
  ) {
    const { title, description, price } = completeBody;
    const generatedId = await this.productService.insertProduct(
      title,
      description,
      price,
    );

    return { id: generatedId };
  }

  @Get()
  async getAll() {
    const result = await this.productService.getAllProducts();
    return result;
  }

  @Get(':id')
  getProduct(@Param('id') prodId: string) {
    return this.productService.getSingleProduct(prodId);
  }

  @Patch(':id')
  async updateProduct(
    @Param('id') prodId: string,
    @Body()
    completeBody: {
      title: string;
      description: string;
      price: number;
    },
  ) {
    return await this.productService.editProduct(completeBody, prodId);
  }

  @Delete(':id')
  async removeProduct(@Param('id') prodId: string) {
    return await this.productService.deleteProduct(prodId);
  }
}
