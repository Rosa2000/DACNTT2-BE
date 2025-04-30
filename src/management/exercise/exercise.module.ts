import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VerifyLoginMiddleware } from "src/middleware/verify_user.middleware";

import { UserVerifyInformation } from "../users/entities/user_authenticate/user_authenticate.entity";
import { Status } from "../common/status/entities/status.entity";
import { Exercise, UserExercise } from "./exercise.entity";
import { ExerciseController } from "./exercise.controller";
import { ExercisesService } from "./exercise.service";
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
      path: "/v1/exercise/*",
      method: RequestMethod.ALL
    });
  }
}
