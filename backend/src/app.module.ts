import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { NotesModule } from './notes/notes.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'auth',
        ttl: 60,
        limit: 5, // Strict limit for auth endpoints
      },
      {
        name: 'api',
        ttl: 60,
        limit: 30, // Moderate limit for CRUD operations
      },
      {
        name: 'read',
        ttl: 60,
        limit: 100, // Higher limit for read operations
      },
    ]),
    NotesModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    RedisModule,
  ],
})
export class AppModule {}
