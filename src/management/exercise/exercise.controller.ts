import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags
} from "@nestjs/swagger";

import { responseMessage } from "src/utils/constant";

import { VerifyLoginMiddleware } from "src/middleware/verify_user.middleware";

import { ExercisesService } from "./exercise.service";
import {
  CreateExerciseDto,
  DoExerciseDto,
  ExerciseIdDto,
  GetDataExerciseDto,
  UpdateExerciseDto,
  UserExerciseIdDto
} from "./exercise.dto";

@Controller("/v1/exercise")
@ApiTags("API quản lý và tương tác bài tập")
export class ExerciseController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post("/add_lesson")
  @ApiOperation({ summary: "Thêm bài tập mới" })
  @ApiBody({ type: CreateExerciseDto })
  @UseGuards(VerifyLoginMiddleware)
  @ApiBearerAuth()
  async handleAddExercise(
    @Body() addRequest: CreateExerciseDto,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      const handleAddExcercise =
        await this.exercisesService.createExercise(addRequest);

      return res.status(HttpStatus.OK).json({
        code: 0,
        message: responseMessage.success,
        data: handleAddExcercise
      });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ code: -5, message: responseMessage.serviceError });
    }
  }

  @Post("/edit_exercise")
  @ApiOperation({ summary: "Thay đổi thông tin bài tập" })
  @ApiBody({ type: UpdateExerciseDto })
  @ApiQuery({ type: ExerciseIdDto })
  @UseGuards(VerifyLoginMiddleware)
  @ApiBearerAuth()
  async handleEditExercise(
    @Query() dataQuery: ExerciseIdDto,
    @Body() editRequest: UpdateExerciseDto,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      const id = Number(dataQuery.id);
      const handleEditExercise = await this.exercisesService.updateExercise(
        id,
        editRequest
      );
      if (handleEditExercise.code == 0) {
        return res.status(HttpStatus.OK).json({
          ...handleEditExercise
        });
      } else {
        return res.status(HttpStatus.OK).json({
          code: handleEditExercise.code,
          message: handleEditExercise.message
        });
      }
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ code: -5, message: responseMessage.serviceError });
    }
  }

  @Post("/delete_exercise")
  @ApiOperation({ summary: "Xóa bài tập" })
  @ApiQuery({ type: ExerciseIdDto })
  @UseGuards(VerifyLoginMiddleware)
  @ApiBearerAuth()
  async handleDeleteExercise(
    @Query() dataQuery: ExerciseIdDto,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      const handleDeleteLesson = await this.exercisesService.deleteExcercise(
        dataQuery.id
      );
      return res.status(HttpStatus.OK).json({
        code: handleDeleteLesson.code,
        message: handleDeleteLesson.message
      });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ code: -5, message: responseMessage.serviceError });
    }
  }

  @Get("/data_exercises")
  @ApiOperation({ summary: "Lấy danh sách bài tập" })
  @ApiQuery({ type: GetDataExerciseDto })
  @UseGuards(VerifyLoginMiddleware)
  @ApiBearerAuth()
  async handleGetDataExercises(
    @Query() dataQuery: GetDataExerciseDto,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      const id = dataQuery?.id;
      const page = dataQuery.page || 0;
      const pageSize = dataQuery.pageSize || 10;
      const filters = dataQuery.filters || "";

      const exerciseInformation = await this.exercisesService.getDataExcercise(
        page,
        pageSize,
        filters,
        id
      );
      return res.status(HttpStatus.OK).json({
        code: 0,
        message: responseMessage.success,
        data: exerciseInformation
      });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ code: -5, message: responseMessage.serviceError });
    }
  }

  @Post("/do_exercise")
  @ApiOperation({ summary: "Làm bài tập" })
  @ApiBody({ type: DoExerciseDto })
  @ApiQuery({ type: UserExerciseIdDto })
  @UseGuards(VerifyLoginMiddleware)
  @ApiBearerAuth()
  async handleDoExercise(
    @Query() dataQuery: UserExerciseIdDto,
    @Body() bodyRequest: DoExerciseDto,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      const id = Number(dataQuery.user_id);
      const handleDoExercise = await this.exercisesService.doExercise(
        bodyRequest,
        id
      );

      return res.status(HttpStatus.OK).json({
        code: 0,
        message: responseMessage.success,
        data: handleDoExercise
      });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ code: -5, message: responseMessage.serviceError });
    }
  }

  @Get("/ranking_list")
  @ApiOperation({ summary: "Lấy danh sách tổng xếp hạng" })
  @UseGuards(VerifyLoginMiddleware)
  @ApiBearerAuth()
  async handleGetRanking(@Req() req: any, @Res() res: any): Promise<any> {
    try {
      const rankingList = await this.exercisesService.getAllRankings();
      return res.status(HttpStatus.OK).json({
        code: 0,
        message: responseMessage.success,
        data: rankingList
      });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ code: -5, message: responseMessage.serviceError });
    }
  }

  @Get("/ranking_list_user")
  @ApiOperation({ summary: "Lấy danh sách xếp hạng của người dùng" })
  @ApiQuery({ type: UserExerciseIdDto })
  @UseGuards(VerifyLoginMiddleware)
  @ApiBearerAuth()
  async handleGetRankingUser(
    @Query() dataQuery: UserExerciseIdDto,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      const rankingUser = await this.exercisesService.getRanking(
        dataQuery.user_id
      );
      return res.status(HttpStatus.OK).json({
        code: 0,
        message: responseMessage.success,
        data: rankingUser
      });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ code: -5, message: responseMessage.serviceError });
    }
  }
}
