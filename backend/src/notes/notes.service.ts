import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto, UpdateNoteDto } from '../schemas/note.schema';
import { PaginationQuery, PaginationResponse } from '../schemas/pagination.schema';
import { Prisma } from '../generated/prisma';

@Injectable()
export class NotesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createNoteDto: CreateNoteDto, userId: number) {
    const note = await this.prisma.note.create({
      data: {
        ...createNoteDto,
        userId,
      },
    });

    // Invalidate user's notes cache
    await this.cacheManager.del(`notes:${userId}`);
    await this.cacheManager.del(`notes:count:${userId}`);

    return note;
  }

  async findAll(userId: number, query: PaginationQuery): Promise<PaginationResponse<any>> {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Create cache key based on query parameters
    const cacheKey = `notes:${userId}:${JSON.stringify(query)}`;

    // Try to get from cache first
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      console.log('Cache HIT: Fetching notes from cache');
      return cachedResult as PaginationResponse<any>;
    }

    console.log('Cache MISS: Fetching notes from database');

    // Build where clause for search
    const where: Prisma.NoteWhereInput = {
      userId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Get total count for pagination
    const total = await this.prisma.note.count({ where });

    // Get paginated data
    const data = await this.prisma.note.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    const totalPages = Math.ceil(total / limit);

    const result = {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    // Cache the result for 5 minutes
    await this.cacheManager.set(cacheKey, result, 300);

    return result;
  }

  async findOne(id: string, userId: number) {
    // Try to get from cache first
    const cacheKey = `note:${id}:${userId}`;
    const cachedNote = await this.cacheManager.get(cacheKey);
    
    if (cachedNote) {
      console.log('Cache HIT: Fetching note from cache');
      return cachedNote;
    }

    console.log('Cache MISS: Fetching note from database');

    const note = await this.prisma.note.findFirst({
      where: { id, userId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Cache the note for 10 minutes
    await this.cacheManager.set(cacheKey, note, 600);

    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, userId: number) {
    const note = await this.findOne(id, userId);

    const updatedNote = await this.prisma.note.update({
      where: { id },
      data: updateNoteDto,
    });

    // Invalidate caches
    await this.cacheManager.del(`note:${id}:${userId}`);
    await this.cacheManager.del(`notes:${userId}`);

    return updatedNote;
  }

  async remove(id: string, userId: number) {
    const note = await this.findOne(id, userId);

    await this.prisma.note.delete({
      where: { id },
    });

    // Invalidate caches
    await this.cacheManager.del(`note:${id}:${userId}`);
    await this.cacheManager.del(`notes:${userId}`);

    return note;
  }
}
