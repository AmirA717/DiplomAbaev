import { Module } from '@nestjs/common';
import { MinigamesController } from './minigames.controller';
import { MinigamesService } from './minigames.service';
import { GamesModule } from '../games/games.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [GamesModule, PrismaModule],
  controllers: [MinigamesController],
  providers: [MinigamesService],
})
export class MinigamesModule {}
