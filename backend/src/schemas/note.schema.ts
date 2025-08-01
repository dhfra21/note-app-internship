import { z } from 'zod';

// Schema for creating a note
export const createNoteSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(1000, 'Content must be less than 1000 characters'),
});

// Schema for updating a note (all fields optional)
export const updateNoteSchema = createNoteSchema.partial();

// Schema for note with all fields
export const noteSchema = createNoteSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// TypeScript types derived from schemas
export type CreateNoteDto = z.infer<typeof createNoteSchema>;
export type UpdateNoteDto = z.infer<typeof updateNoteSchema>;
export type Note = z.infer<typeof noteSchema>; 