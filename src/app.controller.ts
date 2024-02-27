import { Controller, Get } from '@nestjs/common';
import { version } from '../package.json';

@Controller()
export class AppController {
  @Get('health')
  public healthCheck(): string {
    return 'OK';
  }

  @Get('version')
  public getVersion(): string {
    return version;
  }

  @Get('ping')
  public ping(): string {
    return 'Pong';
  }
}
