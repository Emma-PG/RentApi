import * as mongoose from 'mongoose';

export const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
});

export interface ProductInterface extends mongoose.Document {
  id: string;
  title: string;
  desc: string;
  price: number;
}

export const ProductModel = mongoose.model<ProductInterface>(
  'Product',
  ProductSchema,
);
