import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const port = process.env.PORT || 5055;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    bufferLogs: true
  });

  app.use(helmet());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle("DA2 Backend")
    .setDescription("API DA2 Backend")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const customOptions = {
    swaggerOptions: {
      filter: true, // Enables filtering by tags
      showRequestDuration: true, // Shows the duration of requests
      defaultModelExpandDepth: 2, // Controls the depth of models displayed
      tagsSorter: "alpha", // Sorts tags alphabetically
      operationsSorter: "alpha", // Sorts operations within tags alphabetically
      defaultModelRendering: "model", // Controls how models are shown (model or schema)
      docExpansion: "none",
      deepLinking: true,
      showExtensions: true
    },
    customCss: `
      .swagger-ui .topbar {
        background-color: #2c3e50;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .swagger-ui .topbar .topbar-wrapper img {
        display: none !important; /* Hide the original Swagger logo */
      }
      .swagger-ui .topbar .topbar-wrapper::before {
        content: '';
        display: block;
        background-size: contain;
        background-repeat: no-repeat;
        height: 50px;
        width: 150px;
        margin-left: 20px;
      }
      .swagger-ui .topbar .topbar-wrapper span {
        color: #ffffff;
        margin-right: 20px;
      }
    `,
    customSiteTitle: "DA2 Backend Docs" // Custom site title.
  };
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("api-docs", app, document, customOptions);
  await app.listen(port);
}
bootstrap();
