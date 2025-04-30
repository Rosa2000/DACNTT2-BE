import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsNumber, IsArray } from "class-validator";

export class GetUserGroupManagementDto {
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

  @IsNumber()
  @IsNotEmpty()
  @ApiPropertyOptional()
  level: number;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  parentId: string;

  @IsArray()
  @IsNotEmpty()
  @ApiPropertyOptional()
  roleId: Array<number>;
}

export class AddGroupRoleDto {
  @IsString()
  @ApiProperty()
  title?: string;

  @IsString()
  @ApiProperty()
  description?: string;

  @IsString()
  @ApiProperty()
  permission?: string;

  @IsString()
  @ApiProperty()
  permission_level2?: string;

  @IsString()
  @ApiProperty()
  permission_level3?: string;
}

export class IdUserGroupDto {
  @IsNumber()
  @ApiProperty()
  id: number;
}
