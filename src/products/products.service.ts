import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductInterface } from './product.model';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product')
    private readonly productModel: Model<ProductInterface>,
  ) {}

  async insertProduct(title: string, desc: string, price: number) {
    // const prodId = Math.round(Math.random() * 10000).toString();

    if (!title) {
      return 'tittle invalid';
    }
    if (!desc) {
      return 'description invalid';
    }
    if (!price) {
      return 'price invalid';
    }

    const newProduct = new this.productModel({
      title: title,
      description: desc,
      price: price,
    });

    const result = await newProduct.save();

    return result.id as string;
  }

  async getAllProducts() {
    const products = await this.productModel.find().exec();

    return products.map((prod) => ({
      id: prod.id,
      title: prod.title,
      description: prod.desc,
      price: prod.price,
    }));
  }

  async getSingleProduct(id: string) {
    const product = await this.findProduct(id);
    return product;
  }

  async editProduct(completeBody, id) {
    const { title, description, price } = completeBody;

    const updatedProduct = await this.findProduct(id);

    if (typeof updatedProduct === 'string') {
      return updatedProduct;
    }
    if (title) {
      updatedProduct.title = title;
    }
    if (description) {
      updatedProduct.description = description;
    }
    if (price) {
      updatedProduct.price = price;
    }

    updatedProduct.save();

    return 'updated correctly';
  }

  async deleteProduct(id) {
    let result;
    try {
      result = await this.productModel.findByIdAndDelete(id).exec();
    } catch (error) {
      throw new NotFoundException('Could not find this product');
    }
    if (result === null) {
      return 'Does not exist';
    }
    return 'deleted succesfully';
  }

  private async findProduct(id: string) {
    let product;
    try {
      product = await this.productModel.findById(id).exec();
    } catch (error) {
      throw new NotFoundException('Could not find this product');
    }
    if (product === null) {
      return 'Does not exist';
    }

    return product;
  }
}
