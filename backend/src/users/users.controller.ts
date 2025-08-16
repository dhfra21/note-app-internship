import { Controller, Post, UseInterceptors, UploadedFile, Get, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaClient } from '@prisma/client';
import { Multer } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiRateLimitGuard } from '../auth/guards/api-rate-limit.guard';
import { Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

@Controller('users')
export class UsersController {
  @Get('test-db')
  async testDb() {
    try {
      const user = await prisma.user.findFirst();
      return { 
        message: 'Database connection successful',
        user: user
      };
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  @Post('upload-profile-picture')
  @UseGuards(JwtAuthGuard, ApiRateLimitGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @UploadedFile() file: Multer.File,
    @Req() req: Request
  ) {
    try {
      console.log('Starting profile picture upload...');
      
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      if (!file.buffer) {
        throw new BadRequestException('File buffer is empty');
      }

      const userId = (req.user as any).userId;

      // verify the user exists
      const existingUser = await prisma.user.findUnique({
        where: {
          id: userId
        }
      });

      if (!existingUser) {
        throw new BadRequestException('User not found');
      }

      // Validate file type
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new BadRequestException('File size too large. Maximum size is 5MB.');
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const profilesDir = path.join(uploadsDir, 'profiles');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      if (!fs.existsSync(profilesDir)) {
        fs.mkdirSync(profilesDir, { recursive: true });
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname) || '.jpg';
      const uniqueFilename = `${userId}-${uuidv4()}${fileExtension}`;
      const filePath = path.join(profilesDir, uniqueFilename);

      // Delete old profile picture if it exists
      if (existingUser.profilePicture) {
        try {
          // Extract filename from the URL path
          const oldFilename = existingUser.profilePicture.split('/').pop();
          if (oldFilename) {
            const oldFilePath = path.join(profilesDir, oldFilename);
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
              console.log(`Deleted old profile picture: ${oldFilePath}`);
            }
          }
        } catch (error) {
          console.error('Error deleting old profile picture:', error);
          // Continue with upload even if deletion fails
        }
      }

      // Write file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Create URL for the image
      const imageUrl = `/uploads/profiles/${uniqueFilename}`;

      // Update the user's profile picture URL
      const updatedUser = await prisma.user.update({
        where: { 
          id: userId
        },
        data: { 
          profilePicture: imageUrl 
        },
      });

      return {
        message: 'Profile picture uploaded successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          hasProfilePicture: !!updatedUser.profilePicture,
          profilePicture: updatedUser.profilePicture
        }
      };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw new BadRequestException(error.message || 'Failed to upload profile picture');
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, ApiRateLimitGuard)
  async getUserProfile(@Req() req: Request) {
    try {
      const userId = (req.user as any).userId;

      const user = await prisma.user.findUnique({
        where: {
          id: userId
        },
        select: {
          id: true,
          email: true,
          profilePicture: true
        }
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          profilePicture: user.profilePicture
        }
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new BadRequestException(error.message || 'Failed to fetch user profile');
    }
  }
} 