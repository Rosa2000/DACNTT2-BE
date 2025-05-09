import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from "typeorm";
@Entity("lessons")
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 250, nullable: false })
  title: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  type: string;

  @Column({ type: "text", nullable: false })
  content: string;

  @Column()
  category: string;

  @Column()
  status_id: number;

  @Column()
  level: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_date: Date;

  @Column({ type: "timestamp", nullable: true })
  modified_date: Date;

  @Column({ type: "timestamp", nullable: true })
  deleted_date: Date;
}

@Entity("user_lessons")
export class UserLesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  lesson_id: number;

  @Column()
  status_id: number;

  @Column({ type: "timestamp", nullable: true })
  modified_date: Date;

  @Column({ type: "timestamp", nullable: true })
  deleted_date: Date;
}
