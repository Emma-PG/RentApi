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
    //FIXME: validation
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
    const avValidation = Array.isArray(
      this.availabilityValidation(availability),
    );

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
    // Check availability validation
    if (avValidation) {
      return [...errors, this.availabilityValidation(availability)];
    }

    return errors;
  }
  //FIXME: get rid of 137-233
  private availabilityValidation(availability) {
    const errors = [];
    // Check if availability is provided and is a boolean
    if (!Array.isArray(availability)) {
      errors.push('Availability is required and must be an array');
    } else {
      // Validate each availability object in the array
      availability.forEach((schedule, index) => {
        if (
          !schedule ||
          typeof schedule !== 'object' ||
          typeof schedule.dayOfWeek !== 'number' ||
          schedule.dayOfWeek < 0 ||
          schedule.dayOfWeek > 6 ||
          typeof schedule.startTime !== 'string' ||
          typeof schedule.endTime !== 'string'
        ) {
          errors.push(
            `Invalid schedule at index ${index}. Each schedule must have the format: { dayOfWeek: number (0-6), startTime: string (HH:MM AM/PM), endTime: string (HH:MM AM/PM) }`,
          );
        } else {
          // Check if start and end times are valid HH:MM AM/PM format
          const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
          if (
            !timeRegex.test(schedule.startTime) ||
            !timeRegex.test(schedule.endTime)
          ) {
            errors.push(
              `Invalid time format for schedule at index ${index}. Time format should be HH:MM AM/PM`,
            );
          } else {
            // Check if start time is before end time
            const startTimeParts = schedule.startTime.split(/[: ]/);
            const endTimeParts = schedule.endTime.split(/[: ]/);
            let startHour = parseInt(startTimeParts[0]);
            let endHour = parseInt(endTimeParts[0]);
            if (startTimeParts[2] === 'PM' && startHour !== 12) startHour += 12;
            if (endTimeParts[2] === 'PM' && endHour !== 12) endHour += 12;
            const timeA = startHour * 60 + parseInt(startTimeParts[1]);
            const timeB = endHour * 60 + parseInt(endTimeParts[1]);
            if (timeA >= timeB) {
              errors.push(
                `Invalid time range for schedule at index ${index}. End time must be after start time`,
              );
            }
          }
        }
      });

      // Check for overlapping schedules
      for (let i = 0; i < availability.length - 1; i++) {
        for (let j = i + 1; j < availability.length; j++) {
          if (availability[i].dayOfWeek === availability[j].dayOfWeek) {
            const startTimeA = this.parseTime(availability[i].startTime);
            const endTimeA = this.parseTime(availability[i].endTime);
            const startTimeB = this.parseTime(availability[j].startTime);
            const endTimeB = this.parseTime(availability[j].endTime);

            if (startTimeA < endTimeB && startTimeB < endTimeA) {
              errors.push(
                `Schedule at index ${i} overlaps with schedule at index ${j}`,
              );
            }
          }
        }
      }
    }

    return errors.length === 0 ? true : errors;
  }

  private parseTime(timeString) {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hours24 = hours;
    if (period === 'PM' && hours !== 12) {
      hours24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hours24 = 0;
    }
    return hours24 * 60 + minutes;
  }

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
