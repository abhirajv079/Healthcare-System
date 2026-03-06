import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Patient } from "./entities/patient.entity";    

@Injectable()
export class PatientsService {
    constructor(
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
    ) {}

    async create(patientData: Partial<Patient>): Promise<Patient> {
        const patient = this.patientRepository.create(patientData);
        return this.patientRepository.save(patient);
    }

    async findById(id: number): Promise<Patient | null> {
        return this.patientRepository.findOne({ where: { id } });
    }

    async findByUserId(userId: number): Promise<Patient | null> {
        return this.patientRepository.findOne({ where: { userId } });
    }

    async update(id: number, updateData: Partial<Patient>): Promise<Patient> {
        await this.patientRepository.update(id, updateData);
        const updatedPatient = await this.patientRepository.findOne({ where: { id } });
        if (!updatedPatient) throw new Error('Patient not found');
        return updatedPatient;
    }

    async delete(id: number): Promise<void> {
        await this.patientRepository.delete(id);
    }   

    async findAll(): Promise<Patient[]> {
        return this.patientRepository.find();
    }

    async findByName(name: string): Promise<Patient[]> {
        return this.patientRepository.find({ where: { name } });
    }

    async findByPhone(phone: string): Promise<Patient[]> {
        return this.patientRepository.find({ where: { phone } });
    }

    async findByAge(age: number): Promise<Patient[]> {
        return this.patientRepository.find({ where: { age } });
    }
    
    async findBySex(sex: string): Promise<Patient[]> {
        return this.patientRepository.find({ where: { sex } });
    }
}