import { Controller, Post, UseInterceptors, UploadedFile, Get, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaClient } from '@prisma/client';
import { Multer } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

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
  @UseGuards(JwtAuthGuard)
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

      // Convert the file to base64
      const base64Image = file.buffer.toString('base64');
      const imageData = `data:${file.mimetype};base64,${base64Image}`;

      // Update the user's profile picture
      const updatedUser = await prisma.user.update({
        where: { 
          id: userId
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
  @UseGuards(JwtAuthGuard)
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