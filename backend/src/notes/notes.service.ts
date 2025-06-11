import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class NotesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createNoteDto: CreateNoteDto, userId: number) {
    try {
      const { title, content } = createNoteDto;
      const note = await this.prisma.note.create({
        data: {
          title,
          content,
          userId,
        } as any,
      });
      // Invalidate user's notes cache
      await this.cacheManager.del(`notes:${userId}`);
      return note;
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
      // Try to get from cache first
      const cachedNotes = await this.cacheManager.get(`notes:${userId}`);
      if (cachedNotes) {
        console.log('Cache HIT: Fetching notes from cache');
        return cachedNotes;
      }

      console.log('Cache MISS: Fetching notes from database');
      // If not in cache, get from database
      const notes = await this.prisma.note.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Store in cache
      await this.cacheManager.set(`notes:${userId}`, notes);
      return notes;
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
      // Try to get from cache first
      const cachedNote = await this.cacheManager.get(`note:${id}`);
      if (cachedNote) {
        console.log('Cache HIT: Fetching note from cache');
        return cachedNote;
      }

      console.log('Cache MISS: Fetching note from database');
      // If not in cache, get from database
      const note = await this.prisma.note.findUnique({
        where: { id, userId },
      });
      if (!note) {
        throw new HttpException('Note not found', HttpStatus.NOT_FOUND);
      }

      // Store in cache
      await this.cacheManager.set(`note:${id}`, note);
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
      const note = await this.prisma.note.update({
        where: { id, userId },
        data: updateNoteDto,
      });
      // Invalidate both note and user's notes cache
      await this.cacheManager.del(`note:${id}`);
      await this.cacheManager.del(`notes:${userId}`);
      return note;
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
      const note = await this.prisma.note.delete({
        where: { id, userId },
      });
      // Invalidate both note and user's notes cache
      await this.cacheManager.del(`note:${id}`);
      await this.cacheManager.del(`notes:${userId}`);
      return note;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new HttpException(
        'Failed to delete note',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
