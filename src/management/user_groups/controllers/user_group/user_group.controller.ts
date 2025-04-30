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

import { UserGroupService } from "../../services/user_group/user_group.service";
import {
  AddGroupRoleDto,
  GetUserGroupManagementDto,
  IdUserGroupDto
} from "../../dtos/user_group/user_group.dto";
import { GroupRoleListRequestData } from "../../interfaces/user_group/user_group.interface";

@Controller("/v1/role_management")
@ApiTags("API quản lý thông tin phân quyền")
export class UserGroupManagmentController {
  constructor(private readonly groupService: UserGroupService) {}

  private async respondWithBadRequest(
    actionType: string,
    req: any,
    res: Response
  ) {
    const userId = req.userData ? req.userData.id : null;

    const dataLog = {
      userId,
      tableName: "group_role, user_group",
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

  private async saveAuditLog(
    actionType: string,
    req: any,
    res: Response,
    data: any,
    success: boolean = true
  ) {
    const responseContent = success
      ? JSON.stringify({ code: 0, message: responseMessage.success, data })
      : JSON.stringify(data);
    const userId = req.userData ? req.userData.id : null;

    const dataLog = {
      userId,
      tableName: "group_role, user_group",
      requestContent: JSON.stringify(req.body),
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      responseContent
    };
  }

  private handleError(res: Response, error: any) {
    console.log(error);
    if (error.response.status !== 500) {
      return res.status(HttpStatus.OK).json({
        code: error.response.code,
        message: error.response.message
      });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: -5,
        message: responseMessage.serviceError
      });
    }
  }

  @Get("/data_role")
  @ApiOperation({ summary: "Lấy danh sách người dùng cuối" })
  @ApiQuery({ type: GetUserGroupManagementDto })
  @ApiBearerAuth()
  @UseGuards(VerifyLoginMiddleware)
  async getListRole(
    @Query() requestGroupData: GetUserGroupManagementDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<any> {
    try {
      const page = requestGroupData.page || 0;
      const pageSize = requestGroupData.pageSize || 10;
      const filters = requestGroupData.filters || "";
      const level = requestGroupData?.level;
      const parentId =
        requestGroupData?.parentId != undefined
          ? JSON.parse(requestGroupData?.parentId)
          : [];
      const roleId =
        requestGroupData?.roleId != undefined ? requestGroupData?.roleId : [];
      const userGroup = await this.groupService.findListGroup(
        page,
        pageSize,
        filters,
        level,
        parentId,
        roleId
      );

      if (userGroup.data.length == 0) {
        res
          .status(HttpStatus.OK)
          .send({ code: -4, message: responseMessage.notFound, data: [] });
      } else {
        res.status(HttpStatus.OK).send({
          code: 0,
          message: responseMessage.success,
          data: [...userGroup.data],
          total: userGroup?.total,
          totalPages: userGroup?.totalPages
        });
      }
      // if (level) {
      // } else {
      //   await this.responseSystemService.respondWithBadRequest("data_role", req, res, "group_roles");
      // }
    } catch (error) {
      console.error("data_role", error);
      await this.saveAuditLog("data_role", req, res, error, false);
      return this.handleError(res, error);
    }
  }
  @Post("/add_role")
  @ApiOperation({ summary: "Thêm vai trò mới" })
  @ApiBody({ type: AddGroupRoleDto })
  @ApiBearerAuth()
  @UseGuards(VerifyLoginMiddleware)
  async handleAddRole(
    @Body() roleData: GroupRoleListRequestData,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<any> {
    try {
      if (Object.keys(req.body).length > 0) {
        const addedRole = await this.groupService.addGroupRole(roleData);
        await this.saveAuditLog("add_role", req, res, addedRole);
        res
          .status(HttpStatus.OK)
          .json({ code: 0, message: responseMessage.success, data: addedRole });
      } else {
        await this.respondWithBadRequest("add_role", req, res);
      }
    } catch (error) {
      console.error("add_role", error);
      await this.saveAuditLog("add_role", req, res, error, false);
      return this.handleError(res, error);
    }
  }

  @Post("/edit_role")
  @ApiOperation({ summary: "Thay đổi thông tin vai trò" })
  @ApiQuery({ type: IdUserGroupDto })
  @ApiBody({ type: AddGroupRoleDto })
  @UseGuards(VerifyLoginMiddleware)
  @ApiBearerAuth()
  async handleEditGroupRole(
    @Query() idUserGroup: IdUserGroupDto,
    @Body() roleData: AddGroupRoleDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<any> {
    const { id } = idUserGroup;
    try {
      if (Object.keys(req.body).length > 0) {
        const editedRole = await this.groupService.handleEditGroupRole(
          id,
          roleData
        );
        await this.saveAuditLog("edit_role", req, res, editedRole);
        res
          .status(HttpStatus.OK)
          .json({ code: 0, message: responseMessage.success });
      } else {
        await this.respondWithBadRequest("edit_role", req, res);
      }
    } catch (error) {
      console.error("edit_role", error);
      await this.saveAuditLog("edit_role", req, res, error, false);
      return this.handleError(res, error);
    }
  }

  @Post("/delete_role")
  @ApiOperation({ summary: "Vô hiệu hóa vai trò" })
  @ApiQuery({ type: IdUserGroupDto })
  @UseGuards(VerifyLoginMiddleware)
  @ApiBearerAuth()
  async handleDeleteGroupRole(
    @Query() idUserGroup: IdUserGroupDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<any> {
    const { id } = idUserGroup;
    try {
      if (id) {
        const deletedRole = await this.groupService.handleDeleteGroupRole(id);
        await this.saveAuditLog("delete_role", req, res, deletedRole);
        res
          .status(HttpStatus.OK)
          .json({ code: 0, message: responseMessage.success });
      } else {
        await this.respondWithBadRequest("delete_role", req, res);
      }
    } catch (error) {
      console.error("delete_role", error);
      await this.saveAuditLog("delete_role", req, res, error, false);
      return this.handleError(res, error);
    }
  }
}
