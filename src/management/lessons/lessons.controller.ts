import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  Delete,
  Query,
  Req,
  Res,
  UseGuards,
  Param,
  Patch
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
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
  UserLessonDto,
  UserLessonResponseDto
} from "./lessons.dto";

@Controller("/v1/lessons")
@ApiTags("API quản lý và tương tác bài học")
export class LessonsController {
  constructor(private readonly lessonService: LessonsService) { }

  // Lấy danh sách bài học
  @Get("/")
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
      const userData = req.userData;

      const id = dataQuery?.id;
      const page = dataQuery.page || 0;
      const pageSize = dataQuery.pageSize || 10;
      const filters = dataQuery.filters || "";
      const status_id = dataQuery.status_id;
      const category = dataQuery.category;
      const level = dataQuery.level;

      const lessonInformation = await this.lessonService.getDataLessons(
        userData,
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

  // Thêm bài học mới
  @Post("/")
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
      const handleAddLesson = await this.lessonService.createLesson(addRequest);

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

  // Thay đổi thông tin bài học
  @Put("/:id")
  @ApiOperation({ summary: "Thay đổi thông tin bài học" })
  @ApiBody({ type: UpdateLessonDto })
  @UseGuards(VerifyLoginMiddleware)
  @ApiBearerAuth()
  async handleEditLesson(
    @Param("id") id: number,
    @Body() editRequest: UpdateLessonDto,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      const handleChangeLesson = await this.lessonService.updateLesson(
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

  @Delete("/:id")
  @ApiOperation({ summary: "Xóa bài học" })
  @ApiQuery({ type: IdLessonDto })
  @UseGuards(VerifyLoginMiddleware)
  @ApiBearerAuth()
  async handleDeleteLesson(
    @Param("id") id: number,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      const handleDeleteLesson = await this.lessonService.deleteLesson(
        id
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

  // Khôi phục bài học
  @Patch("/restore/:id")
  @ApiOperation({ summary: "Khôi phục bài học" })
  @ApiParam({ name: "id", required: true, description: "ID bài học cần khôi phục" })
  @UseGuards(VerifyLoginMiddleware)
  @ApiBearerAuth()
  async handleRestoreLesson(
    @Param("id") id: number,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      const handleRestoreLesson = await this.lessonService.restoreLesson(id);
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

  // API học tập
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
      const handleStudy = await this.lessonService.studyLesson(
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

  // Lấy thông tin học tập của người dùng
  @Get("/user-lessons")
  @ApiOperation({ summary: "Lấy thông tin học tập của người dùng" })
  @UseGuards(VerifyLoginMiddleware)
  @ApiBearerAuth()
  async handleGetUserLessons(
    @Query() dataQuery: UserLessonResponseDto,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      const userData = req.userData;
      const userLessons = await this.lessonService.getUserLessons(
        userData.id,
        dataQuery.status_id,
        dataQuery.page,
        dataQuery.pageSize
      );
      return res.status(HttpStatus.OK).json({
        code: 0,
        message: responseMessage.success,
        data: userLessons
      });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ code: -5, message: responseMessage.serviceError });
    }
  }
}