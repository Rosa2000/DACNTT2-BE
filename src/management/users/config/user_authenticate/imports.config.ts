import { TypeOrmModule } from "@nestjs/typeorm";
import {
  ChangePasswordInformation,
  UserLoginInformation,
  UserVerifyInformation
} from "../../entities/user_authenticate/user_authenticate.entity";
import { AddUserInformation } from "../../entities/user_management/user_management.entity";
import {
  GroupRole,
  UserGroup
} from "src/management/user_groups/entities/user_group/user_group.entity";
import { Status } from "src/management/common/status/entities/status.entity";

export const UserAuthenticateManagementImports = [
  TypeOrmModule.forFeature([
    UserLoginInformation,
    UserVerifyInformation,
    ChangePasswordInformation,
    AddUserInformation,
    GroupRole,
    Status,
    UserGroup
  ])
];
