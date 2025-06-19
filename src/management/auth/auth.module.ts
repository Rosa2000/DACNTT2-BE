/*
https://docs.nestjs.com/modules
*/

import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { UserAuthenticateManagementProviders } from "./config/providers.config";
import { UserAuthenticateManagementImports } from "./config/imports.config";
import { UserAuthenticateManagementController } from "./auth.controller";
import { VerifyLoginMiddleware } from "src/middleware/verify_user.middleware";
import { CustomMailerModule } from "src/services/mailer/mailer.module";
@Module({
  imports: [...UserAuthenticateManagementImports, CustomMailerModule],
  controllers: [UserAuthenticateManagementController],
  providers: [...UserAuthenticateManagementProviders]
})
export class UserAuthenticateModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyLoginMiddleware)
      .forRoutes({ path: "/v1/auth/verify-login", method: RequestMethod.ALL });
  }
}
