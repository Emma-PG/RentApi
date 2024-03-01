import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Service } from './service.model';
import { Model } from 'mongoose';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel('Service')
    private readonly serviceModel: Model<Service>,
  ) {}

  async getAllServices() {
    let services;

    try {
      services = await this.serviceModel.find().exec();
    } catch (error) {
      return error.message;
    }
    //FIXME: remove id
    return services.map((serv: Service) => ({
      id: serv.id,
      title: serv.title,
      description: serv.description,
      price: serv.price,
      availability: serv.availability,
    }));
  }

  async addService(
    title: string,
    description: string,
    price: number,
    availability: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    },
  ) {
    let service;
    //FIXME: validation
    const errors = this.addServiceValidation(
      title,
      description,
      price,
      availability,
    );

    if (errors.length === 0) {
      const newService = new this.serviceModel({
        title,
        description,
        price,
        availability,
      });

      try {
        service = await newService.save();
      } catch (error) {
        return error.message;
      }

      return service;
    } else {
      return { 'Errors found:': errors };
    }
  }

  async getOneService(id) {
    let service;

    try {
      service = await this.serviceModel.findById(id).exec();
    } catch (error) {
      return error.message;
    }

    return service === null ? 'This service does not exist' : service;
  }

  async deleteOne(id) {
    let service;
    try {
      service = await this.serviceModel.findByIdAndDelete(id).exec();
    } catch (error) {
      return error.message;
    }
    return service === null
      ? 'This service does not exist '
      : `${service.title} was deleted`;
  }

  async updateOne(id, body) {
    let service;
    try {
      service = await this.serviceModel.findByIdAndUpdate(id, body).exec();
    } catch (error) {
      return error.message;
    }

    return service === null ? 'This service does not exist' : null;
  }

  private addServiceValidation(title, description, price, availability) {
    const errors = [];

    // Check if title is provided and is a non-empty string
    if (!title || typeof title !== 'string' || title.trim() === '') {
      errors.push('Title is required and must be a non-empty string');
    }

    // Check if description is provided and is a non-empty string
    if (
      !description ||
      typeof description !== 'string' ||
      description.trim() === ''
    ) {
      errors.push('Description is required and must be a non-empty string');
    }

    // Check if price is provided and is a positive number
    if (typeof price !== 'number' || price <= 0) {
      errors.push('Price is required and must be a positive number');
    }

    // Check if availability is provided and is a boolean

    if (!Array.isArray(availability)) {
      errors.push('Availability is required and must be an array of schedules');
    } else {
      // Validate each schedule in the availability array
      availability.forEach((schedule, index) => {
        // Validate dayOfWeek
        if (
          typeof schedule.dayOfWeek !== 'number' ||
          schedule.dayOfWeek < 0 ||
          schedule.dayOfWeek > 6
        ) {
          errors.push(
            `Invalid dayOfWeek at index ${index} in the availability array. It must be a number between 0 and 6.`,
          );
        }
        // Validate startTime
        if (
          typeof schedule.startTime !== 'string' ||
          schedule.startTime.trim() === ''
        ) {
          errors.push(
            `Invalid startTime at index ${index} in the availability array. It must be a non-empty string.`,
          );
        }
        // Validate endTime
        if (
          typeof schedule.endTime !== 'string' ||
          schedule.endTime.trim() === ''
        ) {
          errors.push(
            `Invalid endTime at index ${index} in the availability array. It must be a non-empty string.`,
          );
        }
      });
    }

    return errors;
  }
}
