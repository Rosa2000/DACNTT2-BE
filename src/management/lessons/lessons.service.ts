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
import { UserExercise } from "../exercise/exercise.entity";
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
    private readonly userLessonRepository: Repository<UserLesson>,
    @InjectRepository(UserExercise)
    private readonly userExerciseRepository: Repository<UserExercise>
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
    userData: any,
    page: number,
    pageSize: number,
    filters?: string,
    id?: number,
    category?: string,
    level?: number,
    status_id?: number
  ): Promise<any> {
    try {
      page = Math.max(1, page);
      const skip = (page - 1) * pageSize;
      // const ads = await this.adRepository.findOne({ where: { id } });

      const queryBuilder = this.lessonRepository
        .createQueryBuilder("lessons")
        // .where("lessons.status_id != :statusId", { statusId: 6 })
        .orderBy("lessons.created_date", "DESC");

      if (!userData.isAdmin) {
        queryBuilder.andWhere("lessons.status_id = :statusId", { statusId: 1 });
      } else {

      }

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

      if (status_id) {
        queryBuilder.andWhere("lessons.status_id = :status_id", { status_id });
      }

      const [lessonListData, total] = await queryBuilder
        .skip(skip)
        .take(pageSize)
        .getManyAndCount();
      const totalPages = Math.ceil(total / pageSize);

      let data = lessonListData;

      if (!userData.isAdmin) {
        const userLessons = await this.userLessonRepository.find({
          where: { user_id: userData.id }
        });
  
        const userExercises = await this.userExerciseRepository.find({
          where: { user_id: userData.id, status_id: 3 },
          relations: ['exercise']
        });
    
        data = lessonListData.map(lesson => {
          const userLesson = userLessons.find(ul => ul.lesson_id === lesson.id);

          const study_status_id = userLesson?.status_id ?? null;
  
          const lessonScores = userExercises
            .filter(ex => ex.exercise?.lesson_id === lesson.id)
            .map(ex => Number(ex.score));
          console.log('lessonScores:', lessonScores);
          const score = lessonScores.length
            ? Math.round(lessonScores.reduce((sum, s) => sum + s, 0))
            : null;
          console.log('score:', score);
  
          return {
            ...lesson,
            study_status_id,
            score
          };
        });
      }

      return {
        data, //: lessonListData.length > 0 ? lessonListData : []
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
    const { category, content, title, type, status_id } = dto;

    const lesson = await this.lessonRepository.findOne({
      where: { id, status_id: 1 }
    });
    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học có ID ${id}`);
    }

    await this.lessonRepository.update(
      { id },
      { category, content, title, type, status_id, modified_date: new Date() }
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

  async restoreLesson(id: number): Promise<any> {
    const lesson = await this.lessonRepository.findOne({
      where: { id, status_id: 2 }
    });
    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học có ID ${id}`);
    }
    await this.lessonRepository.update(
      { id },
      { status_id: 1, deleted_date: undefined, modified_date: new Date() }
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
        "Trạng thái không hợp lệ. Phải là 3 (đã bắt đầu), 4 (đang học), hoặc 5 (đã kết thúc)"
      );
    }

    // Tìm bản ghi user_lesson hiện tại (nếu có)
    let userLesson = await this.userLessonRepository.findOne({
      where: { user_id: userId, lesson_id: dto.lesson_id }
    });

    if (userLesson) {
      // // Nếu bài học đã kết thúc (status_id = 5), không cho phép cập nhật
      // if (userLesson.status_id === 5) {
      //   throw new BadRequestException("Bài học đã kết thúc");
      // }

      // // Kiểm tra trạng thái chuyển tiếp hợp lệ
      // if (dto.status_id <= userLesson.status_id) {
      //   throw new BadRequestException("Không thể quay lại trạng thái trước");
      // }

      // Cập nhật trạng thái và tiến độ
      userLesson.status_id = dto.status_id;
      userLesson.modified_date = new Date();
    } else {
      // Nếu chưa có bản ghi, tự động tạo mới với status_id = 4 (đang học)
      userLesson = this.userLessonRepository.create({
        user_id: userId,
        lesson_id: dto.lesson_id,
        status_id: 4 // Tự động set trạng thái "đang học"
      });
    }

    try {
    const savedUserLesson = await this.userLessonRepository.save(userLesson);
    console.log('savedUserLesson:', savedUserLesson);
    const result = await this.userLessonRepository.findOne({
      where: { id: savedUserLesson.id }
    });
    console.log('result:', result);
    return new UserLessonResponseDto(result);
    } catch (error) {
      console.error('Lỗi khi lưu userLesson:', error);
      throw error; // hoặc return lỗi nếu muốn
    }
  }

  async getUserLessons(
    userId: number,
    status_id?: number,
    page?: number,
    pageSize?: number
  ): Promise<UserLessonResponseDto[]> {
    try {
      page = Math.max(1, page ?? 1);
      const skip = (page - 1) * (pageSize ?? 10);
  
      const queryBuilder = this.userLessonRepository
        .createQueryBuilder("user_lessons")
        .where("user_lessons.user_id = :userId", { userId })
        .orderBy("user_lessons.created_date", "DESC");
  
      if (status_id) {
        queryBuilder.andWhere("user_lessons.status_id = :statusId", { statusId: status_id });
      }
  
      const userLessons = await queryBuilder
        .skip(skip)
        .take(pageSize ?? 10)
        .getMany();
  
      return userLessons.map(userLesson => new UserLessonResponseDto(userLesson));
    } catch (error) {
      console.error('Lỗi khi lấy userLessons:', error);
      throw new InternalServerErrorException({
        code: -5,
        message: responseMessage.serviceError
      });
    }
  }
}
