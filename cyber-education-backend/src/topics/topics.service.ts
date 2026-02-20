import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TopicsQueryDto } from './dto/topics-query.dto';

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

  async listTopics(query: TopicsQueryDto, role?: UserRole) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(query.search
        ? {
            OR: [
              {
                title: { contains: query.search, mode: 'insensitive' as const },
              },
              {
                description: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
      ...(role === UserRole.ADMIN && query.includeUnpublished
        ? {}
        : { isPublished: true }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.topic.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
      }),
      this.prisma.topic.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getTopicById(id: number, role?: UserRole) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
    });

    if (!topic || (!topic.isPublished && role !== UserRole.ADMIN)) {
      throw new NotFoundException('Тема не найдена');
    }

    return topic;
  }

  async getTopicMaterials(topicId: number, role?: UserRole) {
    await this.getTopicById(topicId, role);

    return this.prisma.material.findMany({
      where: {
        topicId,
        ...(role === UserRole.ADMIN ? {} : { isPublished: true }),
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });
  }

  async listMaterials(topicId?: number) {
    return this.prisma.material.findMany({
      where: {
        isPublished: true,
        ...(topicId ? { topicId } : {}),
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });
  }
}
