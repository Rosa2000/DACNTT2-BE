// src/app.module.ts
import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { AppService } from "./app.service";
import { databaseConfig } from "./configs/data.config";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ManagementAppImports } from "./configs/imports.config";
import { ManagementAppProviders } from "./configs/providers.config";
import { VerifyLoginMiddleware } from "./middleware/verify_user.middleware";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { join } from "path";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(databaseConfig()),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
      defaults: {
        from: '"EZEnglish" <' + process.env.EMAIL_USER + '>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
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
