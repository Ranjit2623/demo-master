import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order]),

        BullModule.registerQueue({
            name: 'email-queue',
        }),
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
})
export class OrdersModule { }

