import { Module } from '@nestjs/common';
import { NotesModule } from './notes/notes.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [NotesModule, PrismaModule, AuthModule, UsersModule],
})
export class AppModule {}
