import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class AuthRateLimitGuard extends ThrottlerGuard {
  protected getThrottleOptions(context: any) {
    return {
      ttl: 60, // 1 minute
      limit: 5, // 5 attempts per minute for auth endpoints
    };
  }
} 