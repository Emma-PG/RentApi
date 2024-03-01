import { Injectable } from '@nestjs/common';

@Injectable()
//can be injected
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
