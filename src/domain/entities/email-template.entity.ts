import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organization_id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text' })
  design: string;

  @Column({ type: 'text' })
  html: string;

  @Column({ type: 'text' })
  example_value_tags: string;

  @Column({ type: 'varchar' })
  image_url: string;

  @CreateDateColumn()
  created_at: string;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @UpdateDateColumn()
  updated_at: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @DeleteDateColumn()
  deleted_at?: string;

  @Column({ type: 'uuid', nullable: true })
  deleted_by?: string;
}
