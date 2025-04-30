import { VerifyLoginMiddleware } from "src/middleware/verify_user.middleware";
import { UserGroupService } from "../../services/user_group/user_group.service";

export const UserGroupManagementProviders = [
  VerifyLoginMiddleware,
  UserGroupService
];
