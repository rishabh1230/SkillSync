import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { rabbitMQConfig } from './config/rabbitmq.config';

async function bootstrap() {
  // Create hybrid application (HTTP + RabbitMQ)
  const app = await NestFactory.create(AppModule);
  
  // Connect RabbitMQ microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: rabbitMQConfig.urls,
      queue: rabbitMQConfig.queue,
      queueOptions: rabbitMQConfig.queueOptions,
    },
  });
  
  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // Enable CORS if needed
  app.enableCors();
  
  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3003); // Different port from other services
  
  console.log('Project Service is running on port 3003');
}
bootstrap();