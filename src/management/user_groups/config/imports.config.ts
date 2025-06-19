import { TypeOrmModule } from "@nestjs/typeorm";

import {
  GroupRole,
  UserGroup
} from "../user_group.entity";

0;
export const UserGroupManagementImports = [
  TypeOrmModule.forFeature([UserGroup, GroupRole])
];
