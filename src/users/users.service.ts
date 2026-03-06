import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './enums/role.enum';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async findByGoogleId(googleId: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { googleId } });
    }

    async createFromGoogle(data: {
        email: string;
        googleId: string;
        name?: string | null;
        profileImageUrl?: string | null;
    }): Promise<User> {
        const user = this.userRepository.create({
            ...data,
            passwordHash: null,
            role: null,
        });
        return this.userRepository.save(user);
    }
    
    async updateRole(userId: number, role: Role): Promise<User> {
        await this.userRepository.update(userId, { role });
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new Error('User not found');
        return user;
    }

    async findById(id: number): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }
}