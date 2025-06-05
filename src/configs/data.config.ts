import * as dotenv from "dotenv";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

dotenv.config();

export interface DatabaseConfig {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  entities?: string[];
  synchronize?: boolean;
}

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: 5432,
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "12345",
  database: process.env.POSTGRES_DB || "ezenglish",
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  synchronize: false,
  ssl: {
    rejectUnauthorized: false, // Bắt buộc với Render
  },
});


