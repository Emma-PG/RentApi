import * as mongoose from 'mongoose';

export const ServiceSchema = new mongoose.Schema<Service>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  availability: [
    {
      dayOfWeek: { type: Number, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
  ],
});

export interface Service extends mongoose.Document {
  title: string;
  description: string;
  price: number;
  availability: [
    {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    },
  ];
}
