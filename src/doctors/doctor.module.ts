import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { DoctorsService } from './doctor.service';

@Module({
    imports: [TypeOrmModule.forFeature([Doctor])],
    providers: [DoctorsService],
    exports: [DoctorsService],
})
export class DoctorsModule {}