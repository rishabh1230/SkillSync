import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';
export const REDIS_SUB_CLIENT = 'REDIS_SUB_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        return new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
      },
    },
    {
      provide: REDIS_SUB_CLIENT,
      useFactory: () => {
        // Separate subscriber connection (Redis pub/sub requires dedicated connection)
        return new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
      },
    },
  ],
  exports: [REDIS_CLIENT, REDIS_SUB_CLIENT],
})
export class RedisModule {}
