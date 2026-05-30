import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GatewayExceptionFilter } from './common/filters/gateway-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalFilters(new GatewayExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
