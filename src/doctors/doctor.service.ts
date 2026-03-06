import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Doctor } from "./entities/doctor.entity";

@Injectable()
export class DoctorsService {
    constructor(
        @InjectRepository(Doctor)
        private readonly doctorRepository: Repository<Doctor>,
    ) {}

    async create(doctorData: Partial<Doctor>): Promise<Doctor> {
        const doctor = this.doctorRepository.create(doctorData);
        return this.doctorRepository.save(doctor);
    }

    async findById(id: number): Promise<Doctor | null> {
        return this.doctorRepository.findOne({ where: { id } });
    }

    async findByUserId(userId: number): Promise<Doctor | null> {
        return this.doctorRepository.findOne({ where: { userId } });
    }

    async update(id: number, updateData: Partial<Doctor>): Promise<Doctor> {
        await this.doctorRepository.update(id, updateData);
        const updatedDoctor = await this.doctorRepository.findOne({ where: { id } });
        if (!updatedDoctor) throw new Error('Doctor not found');
        return updatedDoctor;
    }
}