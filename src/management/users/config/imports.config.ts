import { TypeOrmModule } from "@nestjs/typeorm";
import {
  AddUserInformation,
  UserInformation
} from "../user_management.entity";
import {
  ChangePasswordInformation,
  UserVerifyInformation
} from "../../auth/auth.entity";
import {
  GroupRole,
  UserGroup
} from "src/management/user_groups/user_group.entity";
import { Status } from "src/management/common/status/entities/status.entity";

export const UserManagementImports = [
  TypeOrmModule.forFeature([
    UserInformation,
    AddUserInformation,
    ChangePasswordInformation,
    UserGroup,
    GroupRole,
    UserVerifyInformation,
    Status
  ])
];
