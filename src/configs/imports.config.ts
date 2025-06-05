import { TypeOrmModule } from "@nestjs/typeorm";
import { Status } from "src/management/common/status/entities/status.entity";
import { ExercisesModule } from "src/management/exercise/exercise.module";
import { LessonsModule } from "src/management/lessons/lessons.module";
import { StatisticsModule } from "src/management/statistics/statistics.module";
import {
  GroupRole,
  UserGroup
} from "src/management/user_groups/entities/user_group/user_group.entity";
import { UserVerifyInformation } from "src/management/users/entities/user_authenticate/user_authenticate.entity";
import { UserAuthenticateModule } from "src/management/users/modules/user_authenticate/user_authenticate.module";
import { UserManagementModule } from "src/management/users/modules/user_management/user_management.module";

export const ManagementAppImports = [
  TypeOrmModule.forFeature([
    UserGroup,
    GroupRole,
    UserVerifyInformation,
    Status
  ]),
  UserAuthenticateModule,
  UserManagementModule,
  LessonsModule,
  ExercisesModule,
  StatisticsModule
];
