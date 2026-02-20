import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: number) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        answers: {
          orderBy: [{ order: 'asc' }, { id: 'asc' }],
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Вопрос не найден');
    }

    return question;
  }
}
