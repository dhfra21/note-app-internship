import { Module } from '@nestjs/common';
import { NotesModule } from './notes/notes.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [NotesModule, PrismaModule, AuthModule],
})
export class AppModule {}
