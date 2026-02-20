import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateTopicDto, UpdateTopicDto } from './dto/topic.dto';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/material.dto';
import { CreateGameDto, UpdateGameDto } from './dto/game.dto';
import { CreateQuizDto, UpdateQuizDto } from './dto/quiz.dto';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/question.dto';
import {
  AdminLearnersQueryDto,
  AdminQuizListQueryDto,
  AdminTopicListQueryDto,
} from './dto/admin-query.dto';
import {
  CreateAchievementDto,
  UpdateAchievementDto,
} from './dto/achievement.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOkResponse()
  @Get('topics')
  listTopics(@Query() query: AdminTopicListQueryDto) {
    return this.adminService.listTopics(query);
  }

  @ApiOkResponse()
  @Post('topics')
  createTopic(@Body() dto: CreateTopicDto) {
    return this.adminService.createTopic(dto);
  }

  @ApiOkResponse()
  @Put('topics/:id')
  putTopic(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTopicDto) {
    return this.adminService.updateTopic(id, dto);
  }

  @ApiOkResponse()
  @Patch('topics/:id')
  patchTopic(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTopicDto,
  ) {
    return this.adminService.updateTopic(id, dto);
  }

  @ApiOkResponse()
  @Delete('topics/:id')
  deleteTopic(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteTopic(id);
  }

  @Post('materials')
  createMaterial(@Body() dto: CreateMaterialDto) {
    return this.adminService.createMaterial(dto);
  }

  @Put('materials/:id')
  putMaterial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMaterialDto,
  ) {
    return this.adminService.updateMaterial(id, dto);
  }

  @Patch('materials/:id')
  patchMaterial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMaterialDto,
  ) {
    return this.adminService.updateMaterial(id, dto);
  }

  @Delete('materials/:id')
  deleteMaterial(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteMaterial(id);
  }

  @Post('games')
  createGame(@Body() dto: CreateGameDto) {
    return this.adminService.createGame(dto);
  }

  @Put('games/:id')
  putGame(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGameDto) {
    return this.adminService.updateGame(id, dto);
  }

  @Patch('games/:id')
  patchGame(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGameDto) {
    return this.adminService.updateGame(id, dto);
  }

  @Delete('games/:id')
  deleteGame(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteGame(id);
  }

  @Get('quizzes')
  listQuizzes(@Query() query: AdminQuizListQueryDto) {
    return this.adminService.listQuizzes(query);
  }

  @Get('quizzes/:id/questions')
  listQuizQuestions(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.listQuizQuestions(id);
  }

  @Post('quizzes')
  createQuiz(@Body() dto: CreateQuizDto) {
    return this.adminService.createQuiz(dto);
  }

  @Put('quizzes/:id')
  putQuiz(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQuizDto) {
    return this.adminService.updateQuiz(id, dto);
  }

  @Patch('quizzes/:id')
  patchQuiz(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQuizDto) {
    return this.adminService.updateQuiz(id, dto);
  }

  @Delete('quizzes/:id')
  deleteQuiz(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteQuiz(id);
  }

  @Post('questions')
  createQuestion(@Body() dto: CreateQuestionDto) {
    return this.adminService.createQuestion(dto);
  }

  @Put('questions/:id')
  putQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.adminService.updateQuestion(id, dto);
  }

  @Patch('questions/:id')
  patchQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.adminService.updateQuestion(id, dto);
  }

  @Delete('questions/:id')
  deleteQuestion(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteQuestion(id);
  }

  @Post('achievements')
  createAchievement(@Body() dto: CreateAchievementDto) {
    return this.adminService.createAchievement(dto);
  }

  @Put('achievements/:id')
  putAchievement(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAchievementDto,
  ) {
    return this.adminService.updateAchievement(id, dto);
  }

  @Patch('achievements/:id')
  patchAchievement(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAchievementDto,
  ) {
    return this.adminService.updateAchievement(id, dto);
  }

  @Delete('achievements/:id')
  deleteAchievement(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteAchievement(id);
  }

  @Get('stats/overview')
  getOverviewStats() {
    return this.adminService.getOverviewStats();
  }

  @Get('stats/learners')
  getLearnersStats(@Query() query: AdminLearnersQueryDto) {
    return this.adminService.getLearnersStats(query);
  }
}
