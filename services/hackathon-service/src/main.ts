import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { MicroserviceExceptionFilter } from './common/filters/microservice-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new MicroserviceExceptionFilter());

  await app.listen(3004);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: 'hackathon_queue',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();

  console.log('Hackathon Service running on port 3004');
}
bootstrap();
