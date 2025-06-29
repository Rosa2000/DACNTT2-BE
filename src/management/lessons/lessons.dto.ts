import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsString, IsOptional, Min, Max } from "class-validator";

export class GetDataLessonDto {
  @IsNumber()
  @ApiProperty({ description: "Số trang để phân trang", example: 1 })
  page: number;

  @IsNumber()
  @ApiProperty({ description: "Số mục trên mỗi trang", example: 10 })
  pageSize: number;

  @IsString()
  @ApiPropertyOptional({ description: "Từ khóa tìm kiếm theo tiêu đề", required: false })
  filters?: string;

  @IsNumber()
  @ApiPropertyOptional({ description: "ID bài học cụ thể", required: false })
  id?: number;

  @IsString()
  @ApiPropertyOptional({ description: "Lọc theo danh mục", required: false })
  category?: string;

  @IsString()
  @ApiPropertyOptional({ description: "Lọc theo loại bài học", required: false })
  type?: string;

  @IsNumber()
  @ApiPropertyOptional({ description: "Lọc theo cấp độ", required: false })
  level?: number;

  @IsNumber()
  @ApiPropertyOptional({ description: "Lọc theo trạng thái", required: false })
  status_id?: number;
}

export class CreateLessonDto {
  @IsString()
  @ApiProperty({ description: "Tiêu đề bài học" })
  title: string;

  @IsString()
  @ApiProperty({ description: "Loại bài học" })
  type: string;

  @IsString()
  @ApiProperty({ description: "Nội dung bài học" })
  content: string;

  @IsNumber()
  @ApiProperty({ description: "ID trạng thái  bài học", enum: [1] })
  status_id: number;

  @IsString()
  @ApiProperty({ description: "Danh mục" })
  category?: string;

  @IsNumber()
  @ApiProperty({ description: "Cấp độ bài học" })
  level?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(480) // Tối đa 8 giờ
  @ApiPropertyOptional({ description: "Thời gian làm bài nếu là bài kiểm tra (phút)", example: 30 })
  duration?: number;
}

export class UpdateLessonDto {
  @IsString()
  @ApiPropertyOptional({ description: "Tiêu đề bài học" })
  title?: string;

  @IsString()
  @ApiPropertyOptional({ description: "Loại bài học" })
  type?: string;

  @IsString()
  @ApiPropertyOptional({ description: "Nội dung bài học" })
  content?: string;

  @IsString()
  @ApiPropertyOptional({ description: "Danh mục" })
  category?: string;

  @IsNumber()
  @ApiPropertyOptional({ description: "Trạng thái" })
  status_id?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(480)
  @ApiPropertyOptional({ description: "Thời gian làm bài nếu là bài kiểm tra (phút)", example: 30 })
  duration?: number;
}

export class IdLessonDto {
  @IsNumber()
  @ApiProperty({ required: true })
  id: number;
}

export class LessonResponseDto {
  @IsNumber()
  @ApiPropertyOptional({ required: true })
  id: number;

  @IsString()
  @ApiPropertyOptional({ description: "Tiêu đề bài học" })
  title: string;

  @IsString()
  @ApiPropertyOptional({ description: "Loại bài học" })
  type: string;

  @IsString()
  @ApiPropertyOptional({ description: "Nội dung bài học" })
  content: string;

  @IsNumber()
  @ApiProperty({ description: "ID trạng thái  bài học", enum: [1] })
  status_id: number;

  @IsString()
  @ApiPropertyOptional({ description: "Danh mục" })
  category?: string;

  @IsNumber()
  @ApiPropertyOptional({ description: "Cấp độ bài học" })
  level?: number;

  @IsNumber()
  @ApiPropertyOptional({ description: "Thời gian học ước tính (phút)" })
  duration?: number;

  created_date: Date;
  modified_date: Date;
  deleted_date: Date;

  constructor(lesson: any) {
    this.id = lesson.id;
    this.title = lesson.title;
    this.type = lesson.type;
    this.content = lesson.content;
    this.status_id = lesson.status;
    this.category = lesson.category;
    this.level = lesson.level;
    this.duration = lesson.duration;
    this.created_date = lesson.created_date;
    this.modified_date = lesson.modified_date;
    this.deleted_date = lesson.deleted_date;
  }
}

export class StudyLessonDto {
  @IsNumber()
  @ApiProperty({ required: true })
  lesson_id: number;

  @IsNumber()
  @ApiProperty({ required: true })
  status_id: number; // 3 (started), 4 (going), 5 (ended)
}

export class UserLessonDto {
  @IsNumber()
  @ApiProperty({ required: true })
  user_id: number;
}

export class UserLessonResponseDto {
  @IsNumber()
  @ApiProperty({ description: "Số trang để phân trang", example: 1 })
  page: number;

  @IsNumber()
  @ApiProperty({ description: "Số mục trên mỗi trang", example: 10 })
  pageSize: number;

  @IsNumber()
  @ApiPropertyOptional({ description: "ID bài học cụ thể"})
  id: number;

  @IsNumber()
  @ApiPropertyOptional({ description: "ID người dùng" })
  user_id: number;

  @IsNumber()
  @ApiPropertyOptional({ description: "ID bài học" })
  lesson_id: number;

  @IsNumber()
  @ApiPropertyOptional({ description: "Trạng thái học tập" })
  status_id: number;

  created_date: Date;
  modified_date: Date;
  deleted_date: Date;

  constructor(userLesson: any) {
    this.id = userLesson.id;
    this.user_id = userLesson.user_id;
    this.lesson_id = userLesson.lesson_id;
    this.status_id = userLesson.status_id;
    this.created_date = userLesson.created_date;
    this.modified_date = userLesson.modified_date;
    this.deleted_date = userLesson.deleted_date;
  }
}
