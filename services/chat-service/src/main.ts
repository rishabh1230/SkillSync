import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS for HTTP + WebSocket
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // ✅ Socket.IO adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // ✅ Global validation
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // ✅ HTTP server
  const port = process.env.PORT || 3005;
  await app.listen(port);

  // ✅ RabbitMQ microservice
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672'],
      queue: 'chat_queue',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();

  console.log(`Chat Service running on port ${port}`);
}

bootstrap();
