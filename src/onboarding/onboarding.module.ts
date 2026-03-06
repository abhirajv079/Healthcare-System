import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { PatientsModule } from '../patients/patient.module';
import { DoctorsModule } from '../doctors/doctor.module';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Doctor]), UsersModule, PatientsModule, DoctorsModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}

