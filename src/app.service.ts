import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly config: ConfigService) {}

  getStatus() {
    return {
      service: 'master-service',
      zone: 'master',
      port: Number(this.config.get<string>('PORT', '3000')),
      database: this.config.get<string>('DB_DATABASE', 'october_node_db'),
      status: 'healthy',
      modules: ['users', 'auth', 'orders', 'email'],
      timestamp: new Date().toISOString(),
    };
  }
}
