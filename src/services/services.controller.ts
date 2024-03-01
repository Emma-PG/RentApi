import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ServiceService } from './services.service';
import { Service } from './service.model';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  async getAll() {
    const res = await this.serviceService.getAllServices();
    return res;
  }

  @Post()
  async insertService(
    @Body()
    body: {
      title: string;
      description: string;
      price: number;
      availability: { dayOfWeek: number; startTime: string; endTime: string };
    },
  ) {
    const { title, description, price, availability } = body;
    const generatedBooking = await this.serviceService.addService(
      title,
      description,
      price,
      availability,
    );

    return generatedBooking;
  }

  @Delete(':id')
  async removeOne(@Param('id') servId: string) {
    return await this.serviceService.deleteOne(servId);
  }

  @Patch(':id')
  async editOne(
    @Param('id') servId: string,
    @Body()
    body: Service,
  ) {
    return await this.serviceService.updateOne(servId, body);
  }

  @Get(':id')
  async getOne(@Param('id') servId: string) {
    const res = await this.serviceService.getOneService(servId);

    return res;
  }
}
