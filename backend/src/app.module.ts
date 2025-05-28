import { Module } from '@nestjs/common';
import { NotesModule } from './notes/notes.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [NotesModule, PrismaModule],
})
export class AppModule {}
