import { TypeOrmModule } from "@nestjs/typeorm";
import { Status } from "src/management/common/status/entities/status.entity";
import { ExercisesModule } from "src/management/exercises/exercises.module";
import { LessonsModule } from "src/management/lessons/lessons.module";
import { StatisticsModule } from "src/management/statistics/statistics.module";
import {
  GroupRole,
  UserGroup
} from "src/management/user_groups/user_group.entity";
import { UserVerifyInformation } from "src/management/auth/auth.entity";
import { UserAuthenticateModule } from "src/management/auth/auth.module";
import { UserManagementModule } from "src/management/users/user_management.module";

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
