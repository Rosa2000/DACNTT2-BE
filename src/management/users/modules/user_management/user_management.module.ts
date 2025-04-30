/*
https://docs.nestjs.com/modules
*/

import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { UserManagementImports } from "../../config/user_management/imports.config";
import { UserManagmentController } from "../../controllers/user_management/user_management.controller";
import { UserManagementProviders } from "../../config/user_management/providers.config";
import { VerifyLoginMiddleware } from "src/middleware/verify_user.middleware";

@Module({
  imports: [...UserManagementImports],
  controllers: [UserManagmentController],
  providers: [...UserManagementProviders]
})
export class UserManagementModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VerifyLoginMiddleware).forRoutes({
      path: "/v1/user_management/*",
      method: RequestMethod.ALL
    });
  }
}
