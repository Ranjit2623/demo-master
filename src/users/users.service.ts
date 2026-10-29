
import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.trim().toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        createdAt: true,
      },
    });
  }

  findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async createUser(dto: RegisterDto) {
    const name = dto.name.trim();
    const email = dto.email.trim().toLowerCase();

    // Check whether the email already exists
    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash the password before storing it
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create and save the user
    const user = this.userRepository.create({
      name,
      email,
      passwordHash,
    });

    console.log(user)

    const savedUser = await this.userRepository.save(user);
    console.log(savedUser)

    // Return safe user information only
    return {
      success: true,
      message: 'User registered successfully',
      data: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        createdAt: savedUser.createdAt,
      },
    };
  }

  async findByIdWithRefreshToken(
    id: number,
  ): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        refreshTokenHash: true,
        createdAt: true,
      },
    });
  }

  async updateRefreshTokenHash(
    id: number,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.userRepository.update(id, {
      refreshTokenHash,
    });
  }
}


