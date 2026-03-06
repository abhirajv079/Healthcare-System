import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Role } from '../users/enums/role.enum';
import { PatientOnboardingDto } from './dto/patient-onboarding.dto';
import { DoctorOnboardingDto } from './dto/doctor-onboarding.dto';
import { PatientsService } from '../patients/patient.service';
import { DoctorsService } from '../doctors/doctor.service';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly usersService: UsersService,
    private readonly patientsService: PatientsService,
    private readonly doctorsService: DoctorsService,
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

    const patient = await this.patientsService.create({
      userId: user.id,
      name: dto.name,
      dateOfBirth: dto.dateOfBirth ?? null,
      sex: dto.sex ?? null,
      age: dto.age ?? null,
      weight: dto.weight ?? null,
      phone: dto.phone ?? null,
    });

    return { user: updatedUser, patient };
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

    const doctor = await this.doctorsService.create({
      userId: user.id,
      name: dto.name,
      specialization: dto.specialization ?? null,
      experienceYears: dto.experienceYears ?? null,
      achievement: dto.achievement ?? null,
      licenseNumber: dto.licenseNumber ?? null,
      profileImageUrl: dto.profileImageUrl ?? null,
    });

    return { user: updatedUser, doctor };
  }
}

