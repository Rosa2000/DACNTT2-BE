import { Response, Request } from "express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags
} from "@nestjs/swagger";
import {
  Controller,
  Get,
  Post,
  HttpStatus,
  Res,
  Req,
  Body,
  Query,
  UseGuards
} from "@nestjs/common";
import { responseMessage } from "src/utils/constant";

import { VerifyLoginMiddleware } from "src/middleware/verify_user.middleware";

import { UserManagementService } from "../../services/user_management/user_management.service";
import {
  AddUserManagementDto,
  EditUserManagementDto,
  GetUserListManagementDto,
  IdUserDto
} from "../../dtos/user_management/user_management.dto";
import {
  ChangePasswordData,
  UserEditRequestData
} from "../../interfaces/user_management/user_management.interface";
import { ChangePasswordDto } from "../../dtos/user_authenticate/user_authenticate.dto";

@Controller("/v1/user_management")
@ApiTags("API quản lý thông tin người dùng")
export class UserManagmentController {
  constructor(private readonly userService: UserManagementService) {}

  private async respondWithBadRequest(
    actionType: string,
    req: any,
    res: Response
  ) {
    const userId = req.userData ? req.userData.id : null;

    const dataLog = {
      userId,
      tableName: "users",
      requestContent: JSON.stringify(req.body),
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      responseContent: responseMessage.badRequest
    };

    return res.status(HttpStatus.OK).json({
      code: -2,
      message: responseMessage.badRequest
    });
  }

  private handleError(res: Response, error: any) {
    if (error.status !== 500) {
      return res.status(HttpStatus.OK).json({
        code: error?.response?.code,
        message: error?.response?.message
      });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: -5,
        message: responseMessage.serviceError
      });
    }
  }

  @Get("/data_user")
  @ApiOperation({ summary: "Lấy danh sách người dùng cuối" })
  @ApiQuery({ type: GetUserListManagementDto })
  @ApiBearerAuth()
  @UseGuards(VerifyLoginMiddleware)
  async getUserList(
    @Query() filterUser: GetUserListManagementDto,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      const page = filterUser.page || 0;
      const pageSize = filterUser.pageSize || 10;
      const filters = filterUser.filters || undefined;
      const groupId = Number(filterUser.groupId);

      if (typeof groupId !== "number") {
        await this.respondWithBadRequest("data_user", req, res);
      }
      const users = await this.userService.findListUser(
        page,
        pageSize,
        filters,
        groupId
      );
      if (users.data.length == 0) {
        res
          .status(HttpStatus.OK)
          .send({ code: 0, message: responseMessage.notFound, data: [] });
      } else {
        res.status(HttpStatus.OK).send({
          code: 0,
          message: responseMessage.success,
          data: [...users.data],
          total: users.total,
          totalPages: users.totalPages
        });
      }
    } catch (error) {
      console.error("data_user", error);
      return this.handleError(res, error);
    }
  }

  @Post("/edit_user")
  @ApiOperation({ summary: "Chỉnh sửa thông tin người dùng cuối" })
  @ApiQuery({ type: IdUserDto })
  @ApiBody({ type: EditUserManagementDto })
  @ApiBearerAuth()
  @UseGuards(VerifyLoginMiddleware)
  async handleEditUser(
    @Query() idUser: IdUserDto,
    @Body() userData: UserEditRequestData,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<any> {
    const { id } = idUser;
    try {
      if (Object.keys(req.body).length > 0) {
        const editedUser = await this.userService.handleEditUser(id, userData);
        res.status(HttpStatus.OK).json({
          code: 0,
          message: responseMessage.success,
          data: editedUser
        });
      } else {
        await this.respondWithBadRequest("edit_user", req, res);
      }
    } catch (error) {
      console.error("edit_user", error);
      return this.handleError(res, error);
    }
  }

  @Post("/add_user")
  @ApiOperation({ summary: "Thêm thông tin user mới" })
  @ApiBody({ type: AddUserManagementDto })
  @ApiBearerAuth()
  @UseGuards(VerifyLoginMiddleware)
  async handleAddUser(
    @Body() userData: AddUserManagementDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<any> {
    try {
      if (Object.keys(req.body).length > 0) {
        const addUser = await this.userService.handleAddUser(userData);
        res
          .status(HttpStatus.OK)
          .json({ code: 0, message: responseMessage.success, data: addUser });
      } else {
        await this.respondWithBadRequest("add_user", req, res);
      }
    } catch (error) {
      console.error("add_user", error);
      return this.handleError(res, error);
    }
  }

  @Post("/delete_user")
  @ApiOperation({ summary: "Xóa thông tin user" })
  @ApiQuery({ type: IdUserDto })
  @ApiBearerAuth()
  @UseGuards(VerifyLoginMiddleware)
  async handleDeleteAircraft(
    @Query() idUser: IdUserDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<any> {
    const { id } = idUser;
    try {
      if (id) {
        const deletedUser = await this.userService.handleDeleteUser(id);

        res
          .status(HttpStatus.OK)
          .json({ code: 0, message: responseMessage.success });
      } else {
        await this.respondWithBadRequest("delete_user", req, res);
      }
    } catch (error) {
      console.error("delete_user", error);
      return this.handleError(res, error);
    }
  }

  @Post("/change_password")
  @ApiOperation({ summary: "Đổi password mới" })
  @ApiQuery({ type: IdUserDto })
  @ApiBody({ type: ChangePasswordDto })
  @ApiBearerAuth()
  @UseGuards(VerifyLoginMiddleware)
  async handleChangePassword(
    @Query() idUser: IdUserDto,
    @Body() changePasswordData: ChangePasswordData,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<any> {
    const { id } = idUser;
    try {
      if (Object.keys(req.body).length > 0) {
        const changePassword = await this.userService.handleChangePassword(
          id,
          changePasswordData
        );
        res
          .status(HttpStatus.OK)
          .json({ code: 0, message: responseMessage.success });
      } else {
        await this.respondWithBadRequest("change_password", req, res);
      }
    } catch (error) {
      console.error("change_password", error);
      return this.handleError(res, error);
    }
  }
}
