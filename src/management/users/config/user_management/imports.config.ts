import { TypeOrmModule } from "@nestjs/typeorm";
import {
  AddUserInformation,
  UserInformation
} from "../../entities/user_management/user_management.entity";
import {
  ChangePasswordInformation,
  UserVerifyInformation
} from "../../entities/user_authenticate/user_authenticate.entity";
import {
  GroupRole,
  UserGroup
} from "src/management/user_groups/entities/user_group/user_group.entity";
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
