import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";

import {
  CreateExerciseDto,
  DoExerciseDto,
  ExerciseResponseDto,
  RankingResponseDto,
  UpdateExerciseDto,
  UserExerciseResponseDto
} from "./exercise.dto";
import { Exercise, UserExercise } from "./exercise.entity";
import { Status } from "../common/status/entities/status.entity";
import { Lesson, UserLesson } from "../lessons/lessons.entity";
import { responseMessage } from "src/utils/constant";

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(UserExercise)
    private readonly userExerciseRepository: Repository<UserExercise>,

    @InjectRepository(UserLesson)
    private readonly userLessonRepository: Repository<UserLesson>
  ) {}

  async createExercise(dto: CreateExerciseDto): Promise<ExerciseResponseDto> {
    const status = await this.statusRepository.findOne({
      where: { id: dto.status_id }
    });
    if (!status) {
      throw new NotFoundException(`Status with ID ${dto.status_id} not found`);
    }

    const lesson = await this.lessonRepository.findOne({
      where: { id: dto.lesson_id, status_id: 1 }
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${dto.lesson_id} not found`);
    }

    const exercise = this.exerciseRepository.create({
      ...dto,
      status_id: status.id,
      lesson_id: lesson.id,
      created_date: new Date()
    });

    const savedExercise = await this.exerciseRepository.save(exercise);
    return new ExerciseResponseDto(savedExercise);
  }

  async getDataExcercise(
    page: number,
    pageSize: number,
    filters?: string,
    lessonId?: number,
    id?: number
  ): Promise<any> {
    try {
      page = Math.max(1, page);
      const skip = (page - 1) * pageSize;
      // const ads = await this.adRepository.findOne({ where: { id } });

      const queryBuilder = this.exerciseRepository
        .createQueryBuilder("excercises")
        .where("excercises.status_id != :statusId", { statusId: 6 })
        .orderBy("excercises.created_date", "DESC");

      if (filters) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.orWhere("excercises.title = :title", {
              title: filters
            });
          })
        );
      }

      if (id) {
        queryBuilder.andWhere("excercises.id = :id", { id });
      }
      if (lessonId) {
        queryBuilder.andWhere("excercises.lesson_id = :lessonId", { lessonId });
      }
      const [excerciseListData, total] = await queryBuilder
        .skip(skip)
        .take(pageSize)
        .getManyAndCount();
      const totalPages = Math.ceil(total / pageSize);

      console.log({
        page,
        pageSize,
        skip,
        filters,
        lessonId,
        id
      });
      console.log('SQL:', queryBuilder.getQuery());
      console.log('Params:', queryBuilder.getParameters());


      return {
        data: excerciseListData.length > 0 ? excerciseListData : [],
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

  async updateExercise(id: number, dto: UpdateExerciseDto): Promise<any> {
    const {
      correct_answer,
      description,
      duration,
      lesson_id,
      options,
      content,
      title,
      type
    } = dto;

    const excercise = await this.exerciseRepository.findOne({
      where: { id, status_id: 1 }
    });
    if (!excercise) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    // làm trống options nếu type là fill_in  
    const updatedOptions = type === "fill_in" ? undefined : options;

    await this.exerciseRepository.update(
      { id },
      {
        correct_answer,
        description,
        duration,
        lesson_id,
        options: updatedOptions,
        content,
        title,
        type,
        modified_date: new Date()
      }
    );
    return { code: 0, message: responseMessage.success };
  }

  async deleteExcercise(id: number): Promise<any> {
    const excercise = await this.exerciseRepository.findOne({
      where: { id, status_id: 1 }
    });
    if (!excercise) {
      throw new NotFoundException(`Excercise with ID ${id} not found`);
    }
    await this.exerciseRepository.update(
      { id },
      { status_id: 2, deleted_date: new Date() }
    );
    return { code: 0, message: responseMessage.success };
  }

  async restoreExercise(id: number): Promise<any> {
    const excercise = await this.exerciseRepository.findOne({
      where: { id, status_id: 2 }
    });
    if (!excercise) {
      throw new NotFoundException(`Excercise with ID ${id} not found`);
    }
    await this.exerciseRepository.update(
      { id },
      { status_id: 1, deleted_date: undefined, modified_date: new Date() }
    );
    return { code: 0, message: responseMessage.success };
  }

  async getExerciseById(id: number): Promise<ExerciseResponseDto> {
    const excercise = await this.exerciseRepository.findOne({
      where: { id, status_id: 1 }
    });
    if (!excercise) {
      throw new NotFoundException(`Excercise with ID ${id} not found`);
    }
    return new ExerciseResponseDto(excercise);
  }


  async doExercise(
    dto: DoExerciseDto,
    userId: number
  ): Promise<UserExerciseResponseDto> {
    // Kiểm tra bài tập tồn tại
    const exercise = await this.exerciseRepository.findOne({
      where: { id: dto.exercise_id, status_id: 1 },
      relations: ["lesson"]
    });
    if (!exercise) {
      throw new NotFoundException(
        `Exercise with ID ${dto.exercise_id} not found`
      );
    }

    // Kiểm tra trạng thái hợp lệ (3, 4, 5)
    if (![3, 4, 5].includes(dto.status_id)) {
      throw new BadRequestException(
        "Invalid status_id. Must be 3 (started), 4 (going), or 5 (ended)"
      );
    }

    // Kiểm tra trạng thái tồn tại
    const status = await this.statusRepository.findOne({
      where: { id: dto.status_id }
    });
    if (!status) {
      throw new NotFoundException(`Status with ID ${dto.status_id} not found`);
    }

    // Kiểm tra học viên đã bắt đầu bài học liên quan chưa
    const userLesson = await this.userLessonRepository.findOne({
      where: {
        user_id: userId,
        lesson_id: exercise.lesson.id
      }
    });
    if (!userLesson || userLesson.status_id < 3) {
      throw new BadRequestException(
        "You must start the related lesson before doing this exercise"
      );
    }

    // Tìm bản ghi user_exercise hiện tại (nếu có)
    let userExercise = await this.userExerciseRepository.findOne({
      where: {
        user_id: userId,
        exercise_id: dto.exercise_id
      },
      relations: ["user", "exercise", "status"]
    });

    if (userExercise) {
      // Nếu bài tập đã kết thúc (status_id = 5), không cho phép cập nhật
      if (userExercise.status_id === 5) {
        throw new BadRequestException("Exercise has already ended");
      }

      // Kiểm tra trạng thái chuyển tiếp hợp lệ
      if (dto.status_id <= userExercise.status_id) {
        throw new BadRequestException("Cannot revert to an earlier status");
      }

      // Cập nhật trạng thái và câu trả lời
      userExercise.status_id = dto.status_id;
      userExercise.user_answer = dto.user_answer;
      userExercise.score = this.calculateScore(
        dto.user_answer,
        exercise.correct_answer
      );
      userExercise.modified_date = new Date();
    } else {
      // Nếu chưa có bản ghi, tạo mới với status_id = 3 (started)
      if (dto.status_id !== 3) {
        throw new BadRequestException(
          "Must start the exercise first (status_id = 3)"
        );
      }

      userExercise = this.userExerciseRepository.create({
        user_id: userId,
        exercise_id: dto.exercise_id,
        status_id: dto.status_id,
        user_answer: dto.user_answer,
        score: this.calculateScore(dto.user_answer, exercise.correct_answer),
        created_date: new Date()
      });
    }

    const savedUserExercise =
      await this.userExerciseRepository.save(userExercise);
    const result = await this.userExerciseRepository.findOne({
      where: { id: savedUserExercise.id },
      relations: ["user", "exercise", "status"]
    });

    return new UserExerciseResponseDto(result);
  }

  private calculateScore(userAnswer: string, correctAnswer: string): number {
    if (userAnswer === correctAnswer) {
      return 10; // Điểm tối đa là 10
    }
    return 0; // Điểm 0 nếu trả lời sai (có thể cải tiến logic tính điểm)
  }

  async getRanking(userId: number): Promise<RankingResponseDto> {
    const userScores = await this.userExerciseRepository
      .createQueryBuilder("user_exercise")
      .select("user_exercise.user_id", "user_id")
      .addSelect("SUM(user_exercise.score)", "total_score")
      .where("user_exercise.deleted_date IS NULL")
      .groupBy("user_exercise.user_id")
      .orderBy("total_score", "DESC")
      .getRawMany();

    const userScore = userScores.find((score) => score.user_id === userId);
    if (!userScore) {
      throw new NotFoundException(
        `No exercise records found for user ID ${userId}`
      );
    }

    const rankPosition =
      userScores.findIndex((score) => score.user_id === userId) + 1;

    return new RankingResponseDto({
      userId: userId,
      totalScore: parseFloat(userScore.total_score) || 0,
      rankPosition: rankPosition
    });
  }

  async getAllRankings(): Promise<RankingResponseDto[]> {
    // Phân quyền: Chỉ Admin được phép xem xếp hạng của tất cả người dùng

    // Tính tổng điểm của tất cả người dùng từ user_exercises
    const userScores = await this.userExerciseRepository
      .createQueryBuilder("user_exercise")
      .select("user_exercise.user_id", "user_id")
      .addSelect("SUM(user_exercise.score)", "total_score")
      .where("user_exercise.deleted_date IS NULL")
      .groupBy("user_exercise.user_id")
      .orderBy("total_score", "DESC")
      .getRawMany();

    // Nếu không có dữ liệu, trả về mảng rỗng
    if (!userScores || userScores.length === 0) {
      return [];
    }

    // Tạo danh sách xếp hạng
    const rankings = userScores.map((score, index) => {
      return new RankingResponseDto({
        userId: score.user_id,
        totalScore: parseFloat(score.total_score) || 0,
        rankPosition: index + 1 // Vị trí xếp hạng
      });
    });

    return rankings;
  }
}
