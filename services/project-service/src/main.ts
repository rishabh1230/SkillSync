import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(3003);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'project_queue',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();

  console.log('Project Service running on port 3003');
}
bootstrap();