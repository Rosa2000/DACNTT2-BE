import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Lesson, UserLesson } from "./lessons.entity";
import { VerifyLoginMiddleware } from "src/middleware/verify_user.middleware";
import { LessonController } from "./lessons.controller";
import { LessonsService } from "./lessons.service";
import { UserVerifyInformation } from "../users/entities/user_authenticate/user_authenticate.entity";
import { Status } from "../common/status/entities/status.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lesson,
      UserLesson,
      UserVerifyInformation,
      Status
    ])
  ],
  controllers: [LessonController],
  providers: [LessonsService, VerifyLoginMiddleware]
})
export class LessonsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VerifyLoginMiddleware).forRoutes({
      path: "/v1/lesson/*",
      method: RequestMethod.ALL
    });
  }
}
