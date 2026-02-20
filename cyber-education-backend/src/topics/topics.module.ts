import { Module } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MaterialsController } from './materials.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TopicsController, MaterialsController],
  providers: [TopicsService],
  exports: [TopicsService],
})
export class TopicsModule {}
