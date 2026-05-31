import { CanActivate, ExecutionContext, Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

/**
 * OptionalJwtAuthGuard - always passes, but populates req.user if a valid token is provided.
 * Used for endpoints that are public but show more data to authenticated users.
 */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE') private client: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      req.user = null;
      return true; // No token — allow through as unauthenticated
    }

    const token = authHeader.split(' ')[1];
    try {
      const user = await firstValueFrom(
        this.client.send('AUTH_VALIDATE_TOKEN', { token }),
      );
      req.user = user;
    } catch {
      req.user = null; // Invalid token — treat as unauthenticated, don't block
    }

    return true;
  }
}
