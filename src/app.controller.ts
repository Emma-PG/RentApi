import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

//root route /
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  //dependency injection specify argument to spect to get

  @Get()
  //get for the root-domain/
  getHello(): string {
    return this.appService.getHello();
  }
}
