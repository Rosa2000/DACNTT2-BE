/*
https://docs.nestjs.com/modules
*/

import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { UserAuthenticateManagementProviders } from "../../config/user_authenticate/providers.config";
import { UserAuthenticateManagementImports } from "../../config/user_authenticate/imports.config";
import { UserAuthenticateManagementController } from "../../controllers/user_authenticate/user_authenticate.controller";
import { VerifyLoginMiddleware } from "src/middleware/verify_user.middleware";

@Module({
  imports: [...UserAuthenticateManagementImports],
  controllers: [UserAuthenticateManagementController],
  providers: [...UserAuthenticateManagementProviders]
})
export class UserAuthenticateModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyLoginMiddleware)
      .forRoutes({ path: "/verify_login", method: RequestMethod.ALL }); // Apply globally or specify routes as needed
  }
}
