import { VerifyLoginMiddleware } from "src/middleware/verify_user.middleware";
import { CustomMailerService } from "src/services/mailer/mailer.service";

export const ManagementAppProviders = [VerifyLoginMiddleware, CustomMailerService];
