import { UserAuthenticateService } from "../auth.service";
import { CustomMailerService } from "src/services/mailer/mailer.service";

export const UserAuthenticateManagementProviders = [UserAuthenticateService, CustomMailerService];
