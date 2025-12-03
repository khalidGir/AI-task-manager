import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'AI Task Manager API with NestJS';
  }

  getTasks(): string {
    return 'Tasks endpoint';
  }

  getUsers(): string {
    return 'Users endpoint';
  }
}