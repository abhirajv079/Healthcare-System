import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', unique: true })
  userId: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  specialization: string | null;

  @Column({ name: 'experience_years', type: 'int', nullable: true })
  experienceYears: number | null;

  @Column({ type: 'varchar', nullable: true })
  achievement: string | null;

  @Column({ name: 'license_number', type: 'varchar', nullable: true })
  licenseNumber: string | null;

  @Column({ name: 'profile_image_url', type: 'varchar', nullable: true })
  profileImageUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

