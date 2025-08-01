import { z } from 'zod';

// Schema for user registration
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be less than 50 characters'),
});

// Schema for user login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be less than 50 characters'),
});

// TypeScript types derived from schemas
export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>; 