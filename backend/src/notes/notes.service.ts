import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(createNoteDto: CreateNoteDto, userId: number) {
    try {
      const { title, content } = createNoteDto;
      return await this.prisma.note.create({
        data: {
          title,
          content,
          userId,
        } as any,
      });
    } catch (error) {
      console.error('Error creating note:', error);
      throw new HttpException(
        'Failed to create note',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(userId: number) {
    try {
      return await this.prisma.note.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw new HttpException(
        'Failed to fetch notes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string, userId: number) {
    try {
      const note = await this.prisma.note.findUnique({
        where: { id, userId },
      });
      if (!note) {
        throw new HttpException('Note not found', HttpStatus.NOT_FOUND);
      }
      return note;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Error fetching note:', error);
      throw new HttpException(
        'Failed to fetch note',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, userId: number) {
    try {
      return await this.prisma.note.update({
        where: { id, userId },
        data: updateNoteDto,
      });
    } catch (error) {
      console.error('Error updating note:', error);
      throw new HttpException(
        'Failed to update note',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string, userId: number) {
    try {
      return await this.prisma.note.delete({
        where: { id, userId },
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new HttpException(
        'Failed to delete note',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
