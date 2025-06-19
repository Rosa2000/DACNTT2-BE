import { VerifyLoginMiddleware } from "src/middleware/verify_user.middleware";
import { UserGroupService } from "../user_group.service";

export const UserGroupManagementProviders = [
  VerifyLoginMiddleware,
  UserGroupService
];
