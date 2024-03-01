import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './products/products.module';
//set database connection
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceModule } from './services/services.module';

@Module({
  //bundle a couple of controllers, providers
  imports: [
    ProductModule,
    ServiceModule,
    MongooseModule.forRoot(
      'mongodb+srv://tokyoep:ZJCAJnwqRmFzYcKq@cluster0.dqysrci.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    ),
  ],
  //you can import modules on modules
  controllers: [AppController],
  //handle request, control how you handle the request do something and send back responses
  providers: [AppService],
  // extra services/clases that you can inject on controllers
})
export class AppModule {}
