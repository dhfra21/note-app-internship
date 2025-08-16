import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ApiRateLimitGuard extends ThrottlerGuard {
  protected getThrottleOptions(context: any) {
    return {
      ttl: 60, // 1 minute
      limit: 30, // 30 requests per minute for API endpoints
    };
  }
} 