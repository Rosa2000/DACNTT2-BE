/*
https://docs.nestjs.com/modules
*/

import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { UserGroupManagementImports } from "./config/imports.config";
import { UserGroupManagementProviders } from "./config/provides.config";
import { UserGroupManagmentController } from "./user_group.controller";
import { VerifyLoginMiddleware } from "src/middleware/verify_user.middleware";

@Module({
  imports: [...UserGroupManagementImports],
  controllers: [UserGroupManagmentController],
  providers: [...UserGroupManagementProviders]
})
export class UserGroupManagementModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VerifyLoginMiddleware).forRoutes({
      path: "/v1/role_management/*",
      method: RequestMethod.ALL
    });
  }
}
