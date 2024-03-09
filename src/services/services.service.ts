import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Service } from './service.model';
import { Model } from 'mongoose';
import { availabilityValidation } from '../utils/availabilityValidation';

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
    return {
      TotalEntries: services.length,
      data: services.map((serv: Service) => ({
        id: serv.id,
        title: serv.title,
        description: serv.description,
        price: serv.price,
        availability: serv.availability,
      })),
    };
  }

  async addService(body) {
    const { title, description, price, availability } = body;
    let service;
    const errors = this.ServiceValidation(
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
    const { title, description, price, availability } = body;
    let service;
    const errors = this.ServiceValidation(
      title,
      description,
      price,
      availability,
    );

    if (errors.length === 0) {
      try {
        service = await this.serviceModel.findByIdAndUpdate(id, body).exec();
      } catch (error) {
        return error.message;
      }

      return service === null ? 'This service does not exist' : null;
    } else {
      return { 'Errors found:': errors };
    }
  }

  private ServiceValidation(title, description, price, availability) {
    const avValidation = Array.isArray(availabilityValidation(availability));

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
    // Check availability validation, overlaps ...
    if (avValidation) {
      return [...errors, availabilityValidation(availability)];
    }

    return errors;
  }

  //FIXME: delete this
  async deleteAll() {
    let service;

    try {
      service = await this.serviceModel
        .deleteMany({ description: 'test' })
        .exec();
    } catch (error) {
      return error.message;
    }

    return service;
  }
}
