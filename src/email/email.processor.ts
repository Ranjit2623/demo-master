import {
    Processor,
    WorkerHost,
    OnWorkerEvent,
} from '@nestjs/bullmq';

import { Job } from 'bullmq';
import { EmailService } from './email.service';

interface OrderEmailJob {
    orderId: number;
    customerName: string;
    customerEmail: string;
    productName: string;
    quantity: number;
    totalAmount: string;
}

@Processor('email-queue', {
    concurrency: 5,
})
export class EmailProcessor extends WorkerHost {
    constructor(
        private readonly emailService: EmailService,
    ) {
        super();
    }

    async process(job: Job<OrderEmailJob>): Promise<void> {
        switch (job.name) {
            case 'order-confirmation':
                console.log(
                    `Processing email job for order ${job.data.orderId}`,
                );

                await this.emailService.sendOrderConfirmation(
                    job.data,
                );

                console.log(
                    `Email job completed for order ${job.data.orderId}`,
                );

                return;

            default:
                throw new Error(`Unknown email job: ${job.name}`);
        }
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job | undefined, error: Error) {
        console.error(
            `Email job ${job?.id ?? 'unknown'} failed: ${error.message}`,
        );
    }
}

