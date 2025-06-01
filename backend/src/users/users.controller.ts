import { Controller, Post, UseInterceptors, UploadedFile, Get, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaClient } from '@prisma/client';
import { Multer } from 'multer';

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
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @UploadedFile() file: Multer.File,
  ) {
    try {
      console.log('Starting profile picture upload...');
      
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      if (!file.buffer) {
        throw new BadRequestException('File buffer is empty');
      }

      // First, let's verify the user exists
      const existingUser = await prisma.user.findUnique({
        where: {
          id: 2
        }
      });

      if (!existingUser) {
        throw new BadRequestException('User not found');
      }

      // Convert the file to base64
      const base64Image = file.buffer.toString('base64');
      const imageData = `data:${file.mimetype};base64,${base64Image}`;

      // Update the user's profile picture
      const updatedUser = await prisma.user.update({
        where: { 
          id: 2
        },
        data: { 
          profilePicture: imageData 
        },
      });

      return {
        message: 'Profile picture uploaded successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          hasProfilePicture: !!updatedUser.profilePicture
        }
      };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw new BadRequestException(error.message || 'Failed to upload profile picture');
    }
  }

  @Get('profile')
  async getUserProfile() {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: 2 // Hardcoded for now, should be replaced with actual user ID from auth
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