import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { StatusModule } from "src/status/status.module";
import { HttpModule } from "@nestjs/axios";

@Module({
    imports: [StatusModule, HttpModule],
    controllers: [NotificationController],
    providers: [NotificationService],
})
export class NotificationModule {};
