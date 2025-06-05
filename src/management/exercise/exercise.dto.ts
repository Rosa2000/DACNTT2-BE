import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty
} from "class-validator";
import { Type } from "class-transformer";

// DTO để tạo bài tập
export class CreateExerciseDto {
  @ApiProperty({ description: "Tiêu đề của bài tập", example: "Grammar Quiz" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: "Mô tả bài tập",
    example: "A quiz on basic grammar"
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Loại bài tập (ví dụ: multiple_choice, fill_in)",
    example: "multiple_choice"
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: "Nội dung bài tập",
    example: "Choose the correct answer"
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: "Danh sách lựa chọn (dành cho bài tập trắc nghiệm)",
    type: "array",
    items: {
      type: "object",
      properties: { id: { type: "string" }, text: { type: "string" } }
    },
    example: [
      { id: "1", text: "A" },
      { id: "2", text: "B" }
    ]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  options?: { id: string; text: string }[];

  @ApiProperty({ description: "ID của bài học liên quan", example: 1 })
  @IsNumber()
  @IsNotEmpty()
  lesson_id: number;

  @ApiProperty({ description: "Đáp án đúng", example: "1" })
  @IsString()
  @IsNotEmpty()
  correct_answer: string;

  @ApiProperty({ description: "ID trạng thái của bài tập", example: 1 })
  @IsNumber()
  @IsNotEmpty()
  status_id: number;

  @ApiPropertyOptional({
    description: "Thời gian làm bài",
    example: "30 minutes"
  })
  @IsOptional()
  @IsString()
  duration?: string;
}

export class GetDataExerciseDto {
  @IsNumber()
  @ApiProperty({ description: "Số trang để phân trang", example: 1 })
  page: number;

  @IsNumber()
  @ApiProperty({ description: "Số mục trên mỗi trang", example: 10 })
  pageSize: number;

  @IsString()
  @ApiPropertyOptional({ required: false })
  filters?: string;

  @IsNumber()
  @ApiPropertyOptional({ required: false })
  id?: number;

  @IsNumber()
  @ApiPropertyOptional({ required: false })
  lessonId?: number;
}

// DTO để cập nhật bài tập
export class UpdateExerciseDto {
  @ApiPropertyOptional({
    description: "Tiêu đề của bài tập",
    example: "Updated Grammar Quiz"
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: "Mô tả bài tập",
    example: "Updated description"
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "Loại bài tập", example: "fill_in" })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: "Nội dung bài tập",
    example: "Updated content"
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: "Danh sách lựa chọn (dành cho bài tập trắc nghiệm)",
    type: "array",
    items: {
      type: "object",
      properties: { id: { type: "string" }, text: { type: "string" } }
    },
    example: [
      { id: "1", text: "A" },
      { id: "2", text: "B" }
    ]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  options?: { id: string; text: string }[];

  @ApiPropertyOptional({ description: "ID của bài học liên quan", example: 2 })
  @IsOptional()
  @IsNumber()
  lesson_id?: number;

  @ApiPropertyOptional({ description: "Đáp án đúng", example: "2" })
  @IsOptional()
  @IsString()
  correct_answer?: string;

  @ApiPropertyOptional({ description: "ID trạng thái của bài tập", example: 2 })
  @IsOptional()
  @IsNumber()
  status_id?: number;

  @ApiPropertyOptional({
    description: "Thời gian làm bài",
    example: "45 minutes"
  })
  @IsOptional()
  @IsString()
  duration?: string;
}

export class ExerciseIdDto {
  @IsNumber()
  @ApiProperty({ description: "ID của bài tập", example: 1 })
  id: number;
}

export class UserExerciseIdDto {
  @IsNumber()
  @ApiProperty({ description: "ID của bài tập", example: 1 })
  user_id: number;
}
// DTO để trả về thông tin bài tập
export class ExerciseResponseDto {
  @ApiProperty({ description: "ID của bài tập", example: 1 })
  id: number;

  @ApiProperty({ description: "Tiêu đề của bài tập", example: "Grammar Quiz" })
  title: string;

  @ApiProperty({
    description: "Mô tả bài tập",
    example: "A quiz on basic grammar"
  })
  description: string;

  @ApiProperty({ description: "Loại bài tập", example: "multiple_choice" })
  type: string;

  @ApiProperty({
    description: "Nội dung bài tập",
    example: "Choose the correct answer"
  })
  content: string;

  @ApiProperty({
    description: "Danh sách lựa chọn (dành cho bài tập trắc nghiệm)",
    type: "array",
    items: {
      type: "object",
      properties: { id: { type: "string" }, text: { type: "string" } }
    },
    example: [
      { id: "1", text: "A" },
      { id: "2", text: "B" }
    ]
  })
  options: { id: string; text: string }[];

  @ApiProperty({
    description: "Thông tin bài học liên quan",
    example: { id: 1, title: "SQL Basics" }
  })
  lesson: { id: number; title: string };

  @ApiProperty({ description: "Đáp án đúng", example: "1" })
  correct_answer: string;

  @ApiProperty({
    description: "Trạng thái của bài tập",
    example: { id: 1, name: "Active" }
  })
  status: { id: number; name: string };

  @ApiProperty({ description: "Ngày tạo", example: "2025-04-25T10:00:00Z" })
  created_date: Date;

  @ApiProperty({ description: "Ngày sửa đổi", example: "2025-04-25T12:00:00Z" })
  modified_date: Date;

  @ApiProperty({ description: "Ngày xóa", example: null })
  deleted_date: Date;

  @ApiProperty({ description: "Thời gian làm bài", example: "30 minutes" })
  duration: string;

  constructor(exercise: any) {
    this.id = exercise.id;
    this.title = exercise.title;
    this.description = exercise.description || "";
    this.type = exercise.type;
    this.content = exercise.content;
    this.options = exercise.options || [];
    this.lesson = exercise.lesson
      ? { id: exercise.lesson.id, title: exercise.lesson.title }
      : { id: 0, title: "" };
    this.correct_answer = exercise.correct_answer;
    this.status = exercise.status;
    this.created_date = exercise.created_date;
    this.modified_date = exercise.modified_date;
    this.deleted_date = exercise.deleted_date;
    this.duration = exercise.duration || "";
  }
}

export class DoExerciseDto {
  exercise_id: number;
  user_answer: string;
  status_id: number; // 3 (started), 4 (going), 5 (ended)
}

export class UserExerciseResponseDto {
  id: number;

  @ApiProperty({
    description: "Id user"
  })
  @IsNumber()
  user_id: number;

  @ApiProperty({
    description: "Id bài tập"
  })
  @IsNumber()
  exercise_id: number;

  @ApiProperty({
    description: "trạng thái"
  })
  status: { id: number; name: string };

  @ApiProperty({
    description: "Câu trả lời của người dùng"
  })
  @IsString()
  user_answer: string;

  @ApiProperty({
    description: "Điểm số"
  })
  @IsNumber()
  score: number;
  created_date: Date;
  modified_date: Date;
  deleted_date: Date;

  constructor(userExercise: any) {
    this.id = userExercise.id;
    this.user_id = userExercise.user.id;
    this.exercise_id = userExercise.exercise.id;
    this.status = userExercise.status;
    this.user_answer = userExercise.user_answer;
    this.score = userExercise.score;
    this.created_date = userExercise.created_date;
    this.modified_date = userExercise.modified_date;
    this.deleted_date = userExercise.deleted_date;
  }
}

export class RankingResponseDto {
  @ApiProperty({
    description: "Id user"
  })
  @IsNumber()
  user_id: number;

  @ApiProperty({
    description: "Tổng điểm"
  })
  @IsNumber()
  total_score: number;

  @ApiProperty({
    description: "Vị trí rank"
  })
  @IsNumber()
  rank_position: number;

  modified_date: Date;

  constructor(ranking: any) {
    this.user_id = ranking.user.id;
    this.total_score = ranking.total_score;
    this.rank_position = ranking.rank_position;
    this.modified_date = ranking.modified_date;
  }
}
