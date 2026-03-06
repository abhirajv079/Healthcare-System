import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Role } from '../users/enums/role.enum';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { PatientOnboardingDto } from './dto/patient-onboarding.dto';
import { DoctorOnboardingDto } from './dto/doctor-onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  async onboardPatient(userId: number, dto: PatientOnboardingDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user.role !== null) {
      throw new BadRequestException('User already has a role');
    }

    const updatedUser = await this.usersService.updateRole(user.id, Role.PATIENT);

    const patient = this.patientRepo.create({
      userId: user.id,
      name: dto.name,
      dateOfBirth: dto.dateOfBirth ?? null,
      sex: dto.sex ?? null,
      age: dto.age ?? null,
      weight: dto.weight ?? null,
      phone: dto.phone ?? null,
    });
    const savedPatient = await this.patientRepo.save(patient);

    return { user: updatedUser, patient: savedPatient };
  }

  async onboardDoctor(userId: number, dto: DoctorOnboardingDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user.role !== null) {
      throw new BadRequestException('User already has a role');
    }

    const updatedUser = await this.usersService.updateRole(user.id, Role.DOCTOR);

    const doctor = this.doctorRepo.create({
      userId: user.id,
      name: dto.name,
      specialization: dto.specialization ?? null,
      experienceYears: dto.experienceYears ?? null,
      achievement: dto.achievement ?? null,
      licenseNumber: dto.licenseNumber ?? null,
      profileImageUrl: dto.profileImageUrl ?? null,
    });
    const savedDoctor = await this.doctorRepo.save(doctor);

    return { user: updatedUser, doctor: savedDoctor };
  }
}

