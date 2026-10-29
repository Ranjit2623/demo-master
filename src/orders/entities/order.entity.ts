import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    customerName: string;

    @Column({ type: 'varchar', length: 255 })
    customerEmail: string;

    @Column({ type: 'varchar', length: 150 })
    productName: string;

    @Column({ type: 'int' })
    quantity: number;

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
    })
    totalAmount: string;

    @CreateDateColumn()
    createdAt: Date;
}