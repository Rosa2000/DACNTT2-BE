import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsNumber, IsOptional, IsArray, IsIn } from "class-validator";

export class GetUserListManagementDto {
  @IsNumber()
  @ApiPropertyOptional({
    description: "Số trang để phân trang",
    example: 1,
    default: 1
  })
  page: number;

  @IsNumber()
  @ApiPropertyOptional({
    description: "Số mục trên mỗi trang",
    example: 10,
    default: 10
  })
  pageSize: number;

  @IsString()
  @ApiPropertyOptional()
  filters: string;

  @IsString()
  @ApiPropertyOptional()
  groupId: number;

  @IsString()
  @ApiPropertyOptional()
  siteId: string;

  @IsNumber()
  @ApiPropertyOptional()
  ssidId: number;

  @IsString()
  @ApiPropertyOptional()
  regionId: string;

  @IsNumber()
  @ApiPropertyOptional()
  statusId?: number;

  @IsString()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc";

}

export class UserDataDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: "Họ và tên" })
  fullname?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: "Email" })
  email?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: "Số điện thoại" })
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: "Giới tính" })
  gender?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: "Địa chỉ" })
  address?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: "Phường/Xã" })
  ward?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: "Quận/Huyện" })
  district?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: "Tỉnh/Thành phố" })
  province?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: "Quốc gia" })
  country?: string;

  @IsArray()
  @Type(() => Number)
  @ApiPropertyOptional({ type: [Number], description: "Vai trò người dùng" })
  @IsNumber({}, { each: true })
  userGroupId?: Array<number>;
}

export class EditUserManagementDto {
  @ApiProperty({ description: "Dữ liệu chỉnh sửa người dùng" })
  data: UserDataDto;
}

export class AddUserDataDto {
  @IsString()
  @ApiProperty({ required: true, description: "Họ và tên" })
  fullname?: string;

  @IsString()
  @ApiProperty({ required: true, description: "Email" })
  email?: string;

  @IsString()
  @ApiProperty({ required: true, description: "Số điện thoại" })
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: "Giới tính" })
  gender?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: "Địa chỉ" })
  address?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: "Phường/Xã" })
  ward?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: "Quận/Huyện" })
  district?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: "Tỉnh/Thành phố" })
  province?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: "Quốc gia" })
  country?: string;

  @IsString()
  @ApiProperty({ required: true, description: "Tên đăng nhập" })
  username?: string;

  @IsString()
  @ApiProperty({ required: true, description: "Mật khẩu" })
  password?: string;

  @IsArray()
  @Type(() => Number)
  @ApiPropertyOptional({ type: [Number], description: "Vai trò người dùng" })
  @IsNumber({}, { each: true })
  userGroupId?: Array<number>;
}

export class AddUserManagementDto {
  @ApiProperty({ description: "Dữ liệu tạo mới người dùng" })
  data: AddUserDataDto;
}

export class UserDto {
  @ApiProperty({ description: "ID của người dùng", example: "abc123" })
  id: string;
}

export class LoginManagementResponseDto {
  @ApiProperty({ description: "Mã trạng thái", example: 0 })
  code: number;

  @ApiProperty({ description: "Thông điệp", example: "Thành công" })
  message: string;

  @ApiProperty({ description: "Dữ liệu người dùng", type: UserDto })
  data: UserDto;
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

export class IdUserDto {
  @IsNumber()
  @ApiProperty()
  id: number;
}
