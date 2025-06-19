// mailer.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { CustomMailerService } from './mailer.service';

@Module({
  imports: [MailerModule],
  providers: [CustomMailerService],
  exports: [CustomMailerService],
})
export class CustomMailerModule {}
