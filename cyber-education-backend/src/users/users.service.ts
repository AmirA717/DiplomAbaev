import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        profilePicture: true,
        role: true,
        totalPoints: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async updateMyProfile(userId: number, dto: UpdateProfileDto) {
    if (dto.username) {
      const existing = await this.prisma.user.findUnique({
        where: { username: dto.username },
        select: { id: true },
      });
      if (existing && existing.id !== userId) {
        throw new BadRequestException('Имя пользователя уже используется');
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        username: dto.username,
        fullName: dto.fullName,
        profilePicture: dto.avatarUrl,
      },
    });

    return this.getMyProfile(userId);
  }
}
