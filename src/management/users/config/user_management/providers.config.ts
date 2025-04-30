import { UserManagementService } from "../../services/user_management/user_management.service";
import { VerifyLoginMiddleware } from "src/middleware/verify_user.middleware";

export const UserManagementProviders = [
  UserManagementService,

  VerifyLoginMiddleware
];
