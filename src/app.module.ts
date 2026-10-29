
import { readFileSync } from 'node:fs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bullmq';

import { OrdersModule } from './orders/orders.module';
import { EmailModule } from './email/email.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { resolve } from 'node:path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(__dirname, '../.env'),
        resolve(process.cwd(), 'apps/master/.env'),
        '.env',
      ],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction =
          config.get<string>('NODE_ENV') === 'production';

        return {
          type: 'mysql' as const,
          host: config.get<string>('DB_HOST'),
          port: Number(config.get<string>('DB_PORT', '3306')),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_DATABASE'),

          ssl: isProduction
            ? {
              ca: readFileSync('/etc/secrets/ca.pem', 'utf8'),
              rejectUnauthorized: true,
            }
            : undefined,

          autoLoadEntities: true,
          synchronize: !isProduction,
        };
      },
    }),

    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? '127.0.0.1',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),

    UsersModule,
    AuthModule,
    OrdersModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }



