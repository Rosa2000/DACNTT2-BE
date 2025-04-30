// src/app.module.ts
import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { AppService } from "./app.service";
import { databaseConfig } from "./configs/data.config";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ManagementAppImports } from "./configs/imports.config";
import { ManagementAppProviders } from "./configs/providers.config";
import { VerifyLoginMiddleware } from "./middleware/verify_user.middleware";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(databaseConfig()),
    ...ManagementAppImports
  ],
  controllers: [],
  providers: [...ManagementAppProviders]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VerifyLoginMiddleware).forRoutes({
      path: "/v1/auth_management/verify_login",
      method: RequestMethod.ALL
    });
    // consumer
    //   .apply(CryptoMiddleware)
    //   .exclude({ path: "/api-docs/*", method: RequestMethod.ALL })
    //   .forRoutes({ path: "/v1/*", method: RequestMethod.ALL });
  }
}
