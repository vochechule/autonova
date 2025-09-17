import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    // ✅ Get the exception response
    const exceptionResponse = exception.getResponse();
    
    let errorResponse;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      // ✅ If it's already a structured error, use it
      errorResponse = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        ...(exceptionResponse as object),
      };
    } else {
      // ✅ Create structured error for simple messages
      errorResponse = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        code: this.getErrorCode(status),
        message: exceptionResponse || exception.message,
      };
    }

    console.error('HTTP Exception:', {
      status,
      response: errorResponse,
      stack: exception.stack,
    });

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'INTERNAL_SERVER_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }
}