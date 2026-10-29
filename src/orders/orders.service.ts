import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';

import { Repository } from 'typeorm';
import { Queue } from 'bullmq';

import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,

        @InjectQueue('email-queue')
        private readonly emailQueue: Queue,
    ) { }

    async createOrder(dto: CreateOrderDto) {
        // Step 1: Create the order entity
        const order = this.orderRepository.create({
            customerName: dto.customerName,
            customerEmail: dto.customerEmail,
            productName: dto.productName,
            quantity: dto.quantity,
            totalAmount: dto.totalAmount.toFixed(2),
        });

        // Step 2: Save the order in MySQL
        const savedOrder = await this.orderRepository.save(order);

        // Step 3: Add the email job to BullMQ
        await this.emailQueue.add(
            'order-confirmation',
            {
                orderId: savedOrder.id,
                customerName: savedOrder.customerName,
                customerEmail: savedOrder.customerEmail,
                productName: savedOrder.productName,
                quantity: savedOrder.quantity,
                totalAmount: savedOrder.totalAmount,
            },
            {
                attempts: 3,

                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },

                removeOnComplete: 100,
                removeOnFail: 500,
            },
        );

        // Step 4: Return the response
        return {
            success: true,
            message: 'Order created successfully. Confirmation email queued.',
            data: savedOrder,
        };
    }
}

