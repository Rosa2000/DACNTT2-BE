import { Response, Request } from "express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags
} from "@nestjs/swagger";
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  HttpStatus,
  Res,
  Req,
  Body,
  Query,
  Param,
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

interface RequestWithUser extends Request {
  userData: {
    id: number;
    user_group?: {
      name: string;
    };
  };
}

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  total?: number;
  totalPages?: number;
}

@Controller("/v1/users")
@ApiTags("API quản lý thông tin người dùng")
@UseGuards(VerifyLoginMiddleware)
export class UserManagmentController {
  constructor(private readonly userService: UserManagementService) {}

  private sendResponse<T>(
    res: Response,
    status: HttpStatus,
    data: ApiResponse<T>
  ): Response {
    return res.status(status).json(data);
  }

  private handleError(res: Response, error: any, action: string): Response {
    console.error(action, error);
    
    if (error.status !== 500) {
      return this.sendResponse(res, error.status || HttpStatus.BAD_REQUEST, {
        code: error?.response?.code,
        message: error?.response?.message
      });
    }
    
    return this.sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, {
      code: -5,
      message: responseMessage.serviceError
    });
  }

  private validateUserAccess(
    currentUserId: number,
    targetUserId: number,
    isAdmin: boolean
  ): boolean {
    return currentUserId === targetUserId || isAdmin;
  }

  private async respondWithBadRequest(
    actionType: string,
    req: RequestWithUser,
    res: Response
  ): Promise<Response> {
    const userId = req.userData?.id;

    const dataLog = {
      userId,
      tableName: "users",
      requestContent: JSON.stringify(req.body),
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      responseContent: responseMessage.badRequest
    };

    return this.sendResponse(res, HttpStatus.BAD_REQUEST, {
      code: -2,
      message: responseMessage.badRequest
    });
  }

  @Get()
  @ApiOperation({ summary: "Lấy danh sách người dùng" })
  @ApiQuery({ type: GetUserListManagementDto })
  @ApiBearerAuth()
  @UseGuards(VerifyLoginMiddleware)
  async getUserList(
    @Query() filterUser: GetUserListManagementDto,
    @Req() req: RequestWithUser,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const { page = 0, pageSize = 10, filters, sortOrder = "asc" } = filterUser;
      const groupId = filterUser.groupId !== undefined ? Number(filterUser.groupId) : undefined;
      const statusId = filterUser.statusId !== undefined ? Number(filterUser.statusId) : undefined;

      const users = await this.userService.getUserList({
        page,
        pageSize,
        filters,
        groupId,
        sortOrder,
        statusId
      });

      if (users.data.length === 0) {
        return this.sendResponse(res, HttpStatus.OK, {
          code: 0,
          message: responseMessage.notFound,
          data: []
        });
      }

      return this.sendResponse(res, HttpStatus.OK, {
        code: 0,
        message: responseMessage.success,
        data: users.data,
        total: users.total,
        totalPages: users.totalPages
      });
    } catch (error) {
      return this.handleError(res, error, "get_users");
    }
  }

  @Get('/:id')
  @ApiOperation({ summary: "Lấy thông tin người dùng theo id" })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBearerAuth()
  @UseGuards(VerifyLoginMiddleware)
  async getUserById(
    @Param() idUser: IdUserDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const user = await this.userService.getUserById(idUser.id);
      
      if (!user) {
        return this.sendResponse(res, HttpStatus.NOT_FOUND, {
          code: -1,
          message: responseMessage.notFound
        });
      }

      return this.sendResponse(res, HttpStatus.OK, {
        code: 0,
        message: responseMessage.success,
        data: user
      });
    } catch (error) {
      return this.handleError(res, error, "get_user_by_id");
    }
  }

  @Put('/:id')
  @ApiOperation({ summary: "Cập nhật thông tin người dùng" })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: EditUserManagementDto })
  @ApiBearerAuth()
  @UseGuards(VerifyLoginMiddleware)
  async updateUser(
    @Param() idUser: IdUserDto,
    @Body() userData: UserEditRequestData,
    @Req() req: RequestWithUser,
    @Res() res: Response
  ): Promise<Response> {
    try {
      if (Object.keys(req.body).length === 0) {
        return this.respondWithBadRequest("update_user", req, res);
      }

      const editedUser = await this.userService.updateUser(idUser.id, userData);
      
      return this.sendResponse(res, HttpStatus.OK, {
        code: 0,
        message: responseMessage.success,
        data: editedUser
      });
    } catch (error) {
      return this.handleError(res, error, "update_user");
    }
  }

  @Post()
  @ApiOperation({ summary: "Thêm người dùng mới" })
  @ApiBody({ type: AddUserManagementDto })
  @ApiBearerAuth()
  @UseGuards(VerifyLoginMiddleware)
  async createUser(
    @Body() userData: AddUserManagementDto,
    @Req() req: RequestWithUser,
    @Res() res: Response
  ): Promise<Response> {
    try {
      if (Object.keys(req.body).length === 0) {
        return this.respondWithBadRequest("create_user", req, res);
      }

      const addUser = await this.userService.createUser(userData);
      
      return this.sendResponse(res, HttpStatus.CREATED, {
        code: 0,
        message: responseMessage.success,
        data: addUser
      });
    } catch (error) {
      return this.handleError(res, error, "create_user");
    }
  }

  @Delete('/:id')
  @ApiOperation({ summary: "Xóa người dùng" })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBearerAuth()
  @UseGuards(VerifyLoginMiddleware)
  async deleteUser(
    @Param() idUser: IdUserDto,
    @Req() req: RequestWithUser,
    @Res() res: Response
  ): Promise<Response> {
    try {
      if (!idUser.id) {
        return this.respondWithBadRequest("delete_user", req, res);
      }

      await this.userService.deleteUser(idUser.id);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      return this.handleError(res, error, "delete_user");
    }
  }

  @Put('/:id/password')
  @ApiOperation({ summary: "Đổi mật khẩu người dùng" })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiBearerAuth()
  async changePassword(
    @Param() idUser: IdUserDto,
    @Body() changePasswordData: ChangePasswordData,
    @Req() req: RequestWithUser,
    @Res() res: Response
  ): Promise<Response> {
    try {
      if (Object.keys(req.body).length === 0) {
        return this.respondWithBadRequest("change_password", req, res);
      }

      const isAdmin = req.userData.user_group?.name === 'admin';
      if (!this.validateUserAccess(req.userData.id, idUser.id, isAdmin)) {
        return this.sendResponse(res, HttpStatus.FORBIDDEN, {
          code: -4,
          message: "Bạn không có quyền thực hiện thao tác này"
        });
      }

      await this.userService.changePassword(idUser.id, changePasswordData);
      
      return this.sendResponse(res, HttpStatus.OK, {
        code: 0,
        message: responseMessage.success
      });
    } catch (error) {
      return this.handleError(res, error, "change_password");
    }
  }

  @Put('/:id/restore')
  @ApiOperation({ summary: "Khôi phục người dùng" })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBearerAuth()
  @UseGuards(VerifyLoginMiddleware)
  async restoreUser(
    @Param() idUser: IdUserDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      await this.userService.restoreUser(idUser.id);
      
      return this.sendResponse(res, HttpStatus.OK, {
        code: 0,
        message: responseMessage.success
      });
    } catch (error) {
      return this.handleError(res, error, "restore_user");
    }
  }
}
