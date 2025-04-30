import { TypeOrmModule } from "@nestjs/typeorm";

import {
  GroupRole,
  UserGroup
} from "../../entities/user_group/user_group.entity";

0;
export const UserGroupManagementImports = [
  TypeOrmModule.forFeature([UserGroup, GroupRole])
];
