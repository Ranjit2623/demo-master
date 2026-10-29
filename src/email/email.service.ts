import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
} from '@nestjs/common';

import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService
    implements OnModuleInit, OnModuleDestroy {
    private transporter: Transporter;

    onModuleInit() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT ?? 587),

            secure:
                Number(process.env.SMTP_PORT ?? 587) === 465,

            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendOrderConfirmation(data: {
        orderId: number;
        customerName: string;
        customerEmail: string;
        productName: string;
        quantity: number;
        totalAmount: string;
    }) {
        const result = await this.transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: data.customerEmail,

            subject: `Order Confirmation #${data.orderId}`,

            html: `
        <h2>Hello ${data.customerName},</h2>

        <p>Your order has been created successfully.</p>

        <h3>Order Details</h3>

        <p><strong>Order ID:</strong> ${data.orderId}</p>
        <p><strong>Product:</strong> ${data.productName}</p>
        <p><strong>Quantity:</strong> ${data.quantity}</p>
        <p><strong>Total Amount:</strong> ${data.totalAmount}</p>

        <p>Thank you for placing your order!</p>
      `,
        });

        console.log(
            `Order confirmation sent for order ${data.orderId}`,
        );

        return result;
    }

    async onModuleDestroy() {
        this.transporter?.close();
    }
}

