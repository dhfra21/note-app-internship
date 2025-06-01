import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [UsersController],
})
export class UsersModule {} 