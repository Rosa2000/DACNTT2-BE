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
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";
import { UserAuthenticateService } from "../../services/user_authenticate/user_authenticate.service";
import {
  ErrorResponseDto,
  LoginManagementDto,
  RegisterManagementDto,
  ResetPasswordDto,
  VerifyEmail
} from "../../dtos/user_authenticate/user_authenticate.dto";
import {
  ManagementLoginRequestData,
  ResetPasswordData
} from "../../interfaces/user_authenticate/user_authenticate.interface";
import { responseMessage } from "src/utils/constant";
import { VerifyLoginMiddleware } from "src/middleware/verify_user.middleware";
import { NextFunction } from "express";

@Controller("/v1/auth_management")
@ApiTags("API Authenticate quản lý hệ thống")
export class UserAuthenticateManagementController {
  constructor(private readonly authenticateService: UserAuthenticateService) {}

  @Post("/login")
  @ApiOperation({ summary: "Đăng nhập trên hệ thống" })
  @ApiBody({ type: LoginManagementDto }) // Use type object to define the schema
  @ApiResponse({
    status: 400,
    description: "Yêu cầu không hợp lệ",
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 500,
    description: "Lỗi dịch vụ",
    type: ErrorResponseDto
  })
  async handleLoginManagement(
    @Body() loginRequest: ManagementLoginRequestData,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      const user = await this.authenticateService.validateUserManagement(
        loginRequest.username,
        loginRequest.password
      );

      if (user) {
        return res.status(HttpStatus.OK).json({
          code: 0,
          message: responseMessage.success,
          data: user
        });
      }
    } catch (error) {
      return res
        .status(error.getStatus())
        .json(error.getResponse());
    }
  }

  @Post("/register")
  @ApiOperation({
    summary: "Đăng ký tài khoản mới",
    description:
      "Lưu ý: Trường hợp đăng ký user ở trang admin isAdmin sẽ là true, còn lại là false"
  })
  @ApiResponse({
    status: 400,
    description: "Yêu cầu không hợp lệ",
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 500,
    description: "Lỗi dịch vụ",
    type: ErrorResponseDto
  })
  @ApiBody({ type: RegisterManagementDto })
  async handleRegister(
    @Body() registerRequest: RegisterManagementDto,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      const result =
        await this.authenticateService.registerUserManagement(registerRequest);
      return res.status(HttpStatus.OK).json({
        code: 0,
        message: responseMessage.success
      });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ code: -5, message: responseMessage.serviceError });
    }
  }

  @Get("/verify_login")
  @ApiOperation({ summary: "Xác thực đăng nhập" })
  @ApiHeader({
    name: "Authorization",
    description: "Bearer token cho authentication",
    required: true
  })
  @UseGuards(VerifyLoginMiddleware)
  async getVerifyLogin(
    @Req() req: any,
    @Res() res: any,
    next: NextFunction
  ): Promise<any> {
    try {
      res.status(HttpStatus.OK).json({
        code: 0,
        message: responseMessage.success,
        data: req.userData
      });
    } catch (error) {
      next(error);
    }
  }

  @Get("/verify_email")
  @ApiOperation({
    summary: "Xác thực email",
    description: "Sử dụng cho mục đích reset password"
  })
  @ApiQuery({ type: VerifyEmail })
  async getVerifyEmail(
    @Query() emailUser: VerifyEmail,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    const { email } = emailUser;
    try {
      if (!email) {
        res
          .status(HttpStatus.OK)
          .json({ code: -2, message: responseMessage.notFound });
      }
      const emailResult = await this.authenticateService.getVerifyEmail(email);
      if (!emailResult) {
        res
          .status(HttpStatus.OK)
          .json({ code: -4, message: responseMessage.notFound });
      } else {
        res.status(HttpStatus.OK).json({
          code: 0,
          message: responseMessage.success,
          data: { ...emailResult }
        });
      }
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ code: -5, message: responseMessage.serviceError });
    }
  }

  @Post("/reset_password")
  @ApiOperation({ summary: "Reset password mới" })
  @ApiBody({ type: ResetPasswordDto })
  async handleResetPassword(
    @Body() resetPasswordData: ResetPasswordData,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    try {
      await this.authenticateService.handleResetPassword(resetPasswordData);
      // await this.responseSystemService.saveAuditLog(
      //   "reset_password",
      //   req,
      //   res,
      //   resetPasswordData
      // );

      return res.status(HttpStatus.OK).json({
        code: 0,
        message: responseMessage.success
      });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ code: -5, message: responseMessage.serviceError });
    }
  }
}
