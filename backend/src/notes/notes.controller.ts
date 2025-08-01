import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UsePipes } from '@nestjs/common';
import { NotesService } from './notes.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createNoteSchema, updateNoteSchema, CreateNoteDto, UpdateNoteDto } from '../schemas/note.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { userId: number };
}

@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createNoteSchema))
  async create(@Body() createNoteDto: CreateNoteDto, @Req() req: AuthenticatedRequest) {
    return this.notesService.create(createNoteDto, req.user.userId);
  }

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.notesService.findAll(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.notesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateNoteSchema))
  async update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto, @Req() req: AuthenticatedRequest) {
    return this.notesService.update(id, updateNoteDto, req.user.userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.notesService.remove(id, req.user.userId);
  }
}
