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
import { LessonsService } from "./lessons.service";
import {
  CreateLessonDto,
  GetDataLessonDto,
  IdLessonDto,
  StudyLessonDto,
  UpdateLessonDto,
  UserLessonDto
} from "./lessons.dto";

@Controller("/v1/lesson")
@ApiTags("API quản lý và tương tác bài học")
export class LessonController {
  constructor(private readonly lessonServcie: LessonsService) {}

  @Post("/add_lesson")
  @ApiOperation({ summary: "Thêm bài học mới" })
  @ApiBody({ type: CreateLessonDto })
  @UseGuards(VerifyLoginMiddleware)
  @ApiBearerAuth()
  async handleAddLesson(
    @Body() addRequest: CreateLessonDto,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      const handleAddLesson = await this.lessonServcie.createLesson(addRequest);

      return res.status(HttpStatus.OK).json({
        code: 0,
        message: responseMessage.success,
        data: handleAddLesson
      });
    } catch (error) {
      console.log("error", error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ code: -5, message: responseMessage.serviceError });
    }
  }

  @Post("/edit_lesson")
  @ApiOperation({ summary: "Thay đổi thông tin bài học" })
  @ApiBody({ type: UpdateLessonDto })
  @ApiQuery({ type: IdLessonDto })
  @UseGuards(VerifyLoginMiddleware)
  @ApiBearerAuth()
  async handleEditLesson(
    @Query() dataQuery: IdLessonDto,
    @Body() editRequest: UpdateLessonDto,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      const id = Number(dataQuery.id);
      const handleChangeLesson = await this.lessonServcie.updateLesson(
        id,
        editRequest
      );
      if (handleChangeLesson.code == 0) {
        return res.status(HttpStatus.OK).json({
          ...handleChangeLesson
        });
      } else {
        return res.status(HttpStatus.OK).json({
          code: handleChangeLesson.code,
          message: handleChangeLesson.message
        });
      }
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ code: -5, message: responseMessage.serviceError });
    }
  }

  @Post("/delete_lesson")
  @ApiOperation({ summary: "Xóa bài học" })
  @ApiQuery({ type: IdLessonDto })
  @UseGuards(VerifyLoginMiddleware)
  @ApiBearerAuth()
  async handleDeleteLesson(
    @Query() dataQuery: IdLessonDto,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      const handleDeleteLesson = await this.lessonServcie.deleteLesson(
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

  @Post("/restore_lesson")
  @ApiOperation({ summary: "Khôi phục bài học" })
  @ApiQuery({ type: IdLessonDto })
  @UseGuards(VerifyLoginMiddleware)
  @ApiBearerAuth()
  async handleRestoreLesson(
    @Query() dataQuery: IdLessonDto,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      const handleRestoreLesson = await this.lessonServcie.restoreLesson(
        dataQuery.id
      );
      return res.status(HttpStatus.OK).json({
        code: handleRestoreLesson.code,
        message: handleRestoreLesson.message
      });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ code: -5, message: responseMessage.serviceError });
    }
  }

  @Get("/data_lessons")
  @ApiOperation({ summary: "Lấy danh sách bài học" })
  @ApiQuery({ type: GetDataLessonDto })
  @UseGuards(VerifyLoginMiddleware)
  @ApiBearerAuth()
  async handleGetDataLessons(
    @Query() dataQuery: GetDataLessonDto,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      const id = dataQuery?.id;
      const page = dataQuery.page || 0;
      const pageSize = dataQuery.pageSize || 10;
      const filters = dataQuery.filters || "";
      const status_id = dataQuery.status_id;
      const category = dataQuery.category;
      const level = dataQuery.level;

      const lessonInformation = await this.lessonServcie.getDataLessons(
        page,
        pageSize,
        filters,
        id,
        category,
        level,
        status_id
      );
      return res.status(HttpStatus.OK).json({
        code: 0,
        message: responseMessage.success,
        data: lessonInformation
      });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ code: -5, message: responseMessage.serviceError });
    }
  }

  @Post("/study")
  @ApiOperation({ summary: "API học tập" })
  @ApiQuery({ type: UserLessonDto })
  @ApiBody({ type: StudyLessonDto })
  @UseGuards(VerifyLoginMiddleware)
  @ApiBearerAuth()
  async handleStudy(
    @Query() dataQuery: UserLessonDto,
    @Body() dataBody: StudyLessonDto,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      const handleStudy = await this.lessonServcie.studyLesson(
        dataBody,
        dataQuery.user_id
      );
      return res.status(HttpStatus.OK).json({
        ...handleStudy
      });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ code: -5, message: responseMessage.serviceError });
    }
  }
}
