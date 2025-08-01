import { z } from 'zod';

// Schema for creating/updating a note
export const noteSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(1000, 'Content must be less than 1000 characters'),
});

// Schema for note with all fields (including server-generated ones)
export const noteWithIdSchema = noteSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

// TypeScript types derived from schemas
export type NoteInput = z.infer<typeof noteSchema>;
export type Note = z.infer<typeof noteWithIdSchema>; 