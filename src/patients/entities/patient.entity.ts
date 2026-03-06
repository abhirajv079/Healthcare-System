import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', unique: true, nullable: true })
  userId: number | null;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: string | null;

  @Column({ type: 'varchar', nullable: true })
  sex: string | null;

  @Column({ type: 'int', nullable: true })
  age: number | null;

  @Column({ type: 'int', nullable: true })
  weight: number | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

