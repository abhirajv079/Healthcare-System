import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloModule } from './hello/hello.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { Patient } from './patients/entities/patient.entity';
import { Doctor } from './doctors/entities/doctor.entity';
import { OnboardingModule } from './onboarding/onboarding.module';
import { PatientsModule } from './patients/patient.module';
import { DoctorsModule } from './doctors/doctor.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), 
    TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'healthcare',
    entities: [User, Patient, Doctor],
    synchronize: true,
  }), HelloModule, UsersModule, AuthModule, OnboardingModule, PatientsModule, DoctorsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
