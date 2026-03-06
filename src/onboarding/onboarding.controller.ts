import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OnboardingService } from './onboarding.service';
import { ReqUser } from './decorators/req-user.decorator';
import { User } from '../users/entities/user.entity';
import { PatientOnboardingDto } from './dto/patient-onboarding.dto';
import { DoctorOnboardingDto } from './dto/doctor-onboarding.dto';

@Controller('onboarding')
@UseGuards(AuthGuard('jwt'))
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('patient')
  async patient(@ReqUser() user: User, @Body() dto: PatientOnboardingDto) {
    console.log('OnboardingController.patient called with user:', user.id, 'dto:', dto);
    return this.onboardingService.onboardPatient(user.id, dto);
  }

  @Post('doctor')
  async doctor(@ReqUser() user: User, @Body() dto: DoctorOnboardingDto) {
    return this.onboardingService.onboardDoctor(user.id, dto);
  }
}

