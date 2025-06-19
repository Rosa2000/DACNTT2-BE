import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VerifyLoginMiddleware } from "src/middleware/verify_user.middleware";

import { UserVerifyInformation } from "../auth/auth.entity";
import { Status } from "../common/status/entities/status.entity";
import { Exercise, UserExercise } from "./exercises.entity";
import { ExerciseController } from "./exercises.controller";
import { ExercisesService } from "./exercises.service";
import { Lesson, UserLesson } from "../lessons/lessons.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserExercise,
      Exercise,
      Lesson,
      UserLesson,
      UserVerifyInformation,
      Status
    ])
  ],
  controllers: [ExerciseController],
  providers: [ExercisesService, VerifyLoginMiddleware]
})
export class ExercisesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VerifyLoginMiddleware).forRoutes({
      path: "/v1/exercise",
      method: RequestMethod.ALL
    },
    {
      path: "/v1/exercise/*",
      method: RequestMethod.ALL
    });
  }
}
