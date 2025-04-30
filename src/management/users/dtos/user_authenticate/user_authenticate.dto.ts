import { IsString, IsEmail, IsNotEmpty, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Tên đăng nhập của người dùng" })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Mật khẩu của người dùng" })
  password: string;
}

export class LoginOauthDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Địa chỉ email của người dùng" })
  email: string;
}

export class LogoutUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Token của người dùng để đăng xuất" })
  token: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Tên đăng nhập của người dùng" })
  username?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Địa chỉ email của người dùng" })
  email?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Mật khẩu mới của người dùng" })
  newPassword?: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Địa chỉ email của người dùng" })
  email?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Mật khẩu cũ của người dùng" })
  oldPassword?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Mật khẩu mới của người dùng" })
  newPassword?: string;
}

export class VerifyEmail {
  @IsString()
  @ApiProperty({ description: "Email của người dùng" })
  email: string;
}

export class RegisterManagementDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Họ và tên đầy đủ của người dùng" })
  fullname: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: "Địa chỉ email của người dùng" })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Số điện thoại của người dùng" })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Tên đăng nhập của người dùng" })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Mật khẩu của người dùng" })
  password: string;

  @IsBoolean()
  @ApiProperty({ description: "Quyền quản trị của người dùng" })
  isAdmin: boolean;
}
export class LoginManagementDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Tên đăng nhập của người dùng" })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Mật khẩu của người dùng" })
  password: string;
}

export class ErrorResponseDto {
  @ApiProperty({ description: "Mã trạng thái lỗi", example: -2 })
  code: number;

  @ApiProperty({
    description: "Thông điệp lỗi",
    example: "Yêu cầu không hợp lệ"
  })
  message: string;
}
