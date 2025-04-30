import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { Lesson } from "../lessons/lessons.entity";

@Entity("exercises")
export class Exercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 250, nullable: false })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  type: string;

  @Column({ type: "text", nullable: false })
  content: string;

  @Column({ type: "jsonb", nullable: true })
  options: { id: string; text: string }[];

  @ManyToOne(() => Lesson)
  @JoinColumn({ name: "lesson_id" })
  lesson: Lesson;

  @Column()
  lesson_id: number;

  @Column({ type: "text", nullable: false })
  correct_answer: string;

  @Column()
  status_id: number; // 1: online, 2: offline

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_date: Date;

  @Column({ type: "timestamp", nullable: true })
  modified_date: Date;

  @Column({ type: "timestamp", nullable: true })
  deleted_date: Date;

  @Column({ type: "varchar", length: 50, nullable: true })
  duration: string;
}

@Entity("user_exercises")
export class UserExercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  exercise_id: number;

  @Column()
  status_id: number;

  @Column({ type: "text", nullable: true })
  user_answer: string;

  @Column({ type: "numeric", precision: 5, scale: 2, nullable: true })
  score: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_date: Date;

  @Column({ type: "timestamp", nullable: true })
  modified_date: Date;

  @Column({ type: "timestamp", nullable: true })
  deleted_date: Date;
}
