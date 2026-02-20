import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse();
      const message =
        typeof errorResponse === 'string'
          ? errorResponse
          : ((errorResponse as { message?: string | string[] }).message ??
            'Не удалось выполнить запрос');

      response.status(status).json({
        statusCode: status,
        message,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const handled = this.handlePrismaKnownError(exception);
      response.status(handled.statusCode).json({
        statusCode: handled.statusCode,
        message: handled.message,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Внутренняя ошибка сервера',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private handlePrismaKnownError(
    exception: Prisma.PrismaClientKnownRequestError,
  ) {
    switch (exception.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Нарушено ограничение уникальности',
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Сущность не найдена',
        };
      default:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Ошибка запроса к базе данных',
        };
    }
  }
}
