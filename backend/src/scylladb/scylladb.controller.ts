import { Controller, Get } from '@nestjs/common';
import { ScylladbService } from './scylladb.service';

@Controller('scylladb')
export class ScylladbController {
  constructor(private readonly scylladbService: ScylladbService) {}

  @Get('test-connection')
  async testConnection() {
    return this.scylladbService.checkConnection();
  }
}
