import { TypeOrmModule } from "@nestjs/typeorm";
import {
  ChangePasswordInformation,
  UserLoginInformation,
  UserVerifyInformation
} from "../auth.entity";
import { AddUserInformation } from "../../users/user_management.entity";
import {
  GroupRole,
  UserGroup
} from "src/management/user_groups/user_group.entity";
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
