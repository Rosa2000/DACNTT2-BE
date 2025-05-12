import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { Lesson, UserLesson } from "./lessons.entity";
import {
  CreateLessonDto,
  LessonResponseDto,
  StudyLessonDto,
  UpdateLessonDto,
  UserLessonResponseDto
} from "./lessons.dto";
import { responseMessage } from "src/utils/constant";

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(UserLesson)
    private readonly userLessonRepository: Repository<UserLesson>
  ) {}

  async createLesson(dto: CreateLessonDto): Promise<LessonResponseDto> {
    const existingLesson = await this.lessonRepository.findOne({
      where: { title: dto.title, status_id: 1 }
    });
    if (existingLesson) {
      throw new BadRequestException("Đã tồn tại bài học với tiêu đề này");
    }

    const lesson = this.lessonRepository.create({
      ...dto,
      created_date: new Date()
    });

    const savedLesson = await this.lessonRepository.save(lesson);
    return new LessonResponseDto(savedLesson);
  }

  async getDataLessons(
    page: number,
    pageSize: number,
    filters?: string,
    id?: number,
    category?: string,
    level?: number
  ): Promise<any> {
    try {
      page = Math.max(1, page);
      const skip = (page - 1) * pageSize;
      // const ads = await this.adRepository.findOne({ where: { id } });

      const queryBuilder = this.lessonRepository
        .createQueryBuilder("lessons")
        .where("lessons.status_id != :statusId", { statusId: 6 })
        .orderBy("lessons.created_date", "DESC");

      if (filters) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.orWhere("lessons.title LIKE :title", {
              title: `%${filters}%`
            });
          })
        );
      }

      if (id) {
        queryBuilder.andWhere("lessons.id = :id", { id });
      }

      if (category) {
        queryBuilder.andWhere("lessons.category = :category", { category });
      }

      if (level) {
        queryBuilder.andWhere("lessons.level = :level", { level });
      }

      const [lessonListData, total] = await queryBuilder
        .skip(skip)
        .take(pageSize)
        .getManyAndCount();
      const totalPages = Math.ceil(total / pageSize);

      return {
        data: lessonListData.length > 0 ? lessonListData : [],
        total: total,
        totalPages: totalPages
      };
    } catch (error) {
      throw new InternalServerErrorException({
        code: -5,
        message: responseMessage.serviceError
      });
    }
  }

  async updateLesson(id: number, dto: UpdateLessonDto): Promise<any> {
    const { category, content, title, type } = dto;

    const lesson = await this.lessonRepository.findOne({
      where: { id, status_id: 1 }
    });
    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học có ID ${id}`);
    }

    await this.lessonRepository.update(
      { id },
      { category, content, title, type, modified_date: new Date() }
    );
    return { code: 0, message: responseMessage.success };
  }

  async deleteLesson(id: number): Promise<any> {
    const lesson = await this.lessonRepository.findOne({
      where: { id, status_id: 1 }
    });
    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học có ID ${id}`);
    }
    await this.lessonRepository.update(
      { id },
      { status_id: 2, deleted_date: new Date() }
    );
    return { code: 0, message: responseMessage.success };
  }

  async studyLesson(
    dto: StudyLessonDto,
    userId: number
  ): Promise<UserLessonResponseDto> {
    // Kiểm tra phân quyền: Chỉ học viên (role = 'user') được phép học

    // Kiểm tra bài học tồn tại
    const lesson = await this.lessonRepository.findOne({
      where: { id: dto.lesson_id }
    });
    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học có ID ${dto.lesson_id}`);
    }

    // Kiểm tra trạng thái hợp lệ (3, 4, 5)
    if (![3, 4, 5].includes(dto.status_id)) {
      throw new BadRequestException(
        "Invalid status_id. Must be 3 (started), 4 (going), or 5 (ended)"
      );
    }

    // Tìm bản ghi user_lesson hiện tại (nếu có)
    let userLesson = await this.userLessonRepository.findOne({
      where: { user_id: userId, lesson_id: dto.lesson_id }
    });

    if (userLesson) {
      // Nếu bài học đã kết thúc (status_id = 5), không cho phép cập nhật
      if (userLesson.status_id === 5) {
        throw new BadRequestException("Lesson has already ended");
      }

      // Kiểm tra trạng thái chuyển tiếp hợp lệ
      if (dto.status_id <= userLesson.status_id) {
        throw new BadRequestException("Cannot revert to an earlier status");
      }

      // Cập nhật trạng thái và tiến độ
      userLesson.status_id = dto.status_id;
      userLesson.modified_date = new Date();
    } else {
      // Nếu chưa có bản ghi, tạo mới với status_id = 3 (started)
      if (dto.status_id !== 3) {
        throw new BadRequestException(
          "Must start the lesson first (status_id = 3)"
        );
      }

      userLesson = this.userLessonRepository.create({
        user_id: userId,
        lesson_id: dto.lesson_id,
        status_id: dto.status_id
      });
    }

    const savedUserLesson = await this.userLessonRepository.save(userLesson);
    const result = await this.userLessonRepository.findOne({
      where: { id: savedUserLesson.id }
    });

    return new UserLessonResponseDto(result);
  }
}
