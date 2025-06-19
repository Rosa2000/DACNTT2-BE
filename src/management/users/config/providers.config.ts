import { UserManagementService } from "../user_management.service";
import { VerifyLoginMiddleware } from "src/middleware/verify_user.middleware";

export const UserManagementProviders = [
  UserManagementService,

  VerifyLoginMiddleware
];
