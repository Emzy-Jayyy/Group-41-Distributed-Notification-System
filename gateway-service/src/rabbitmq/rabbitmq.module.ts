import { Module, Global } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as amqp from "amqplib";

@Global()
@Module({
    providers: [
        {
            provide: "RABBITMQ_CONNECTION",
            useFactory: async (config: ConfigService) => {
                const url = config.get<string>('rabbitmq.url') || 'amqp://localhost:5672';
                const connection = await amqp.connect(url);
                return connection;
            },
            inject: [ConfigService],
        },
    ],
    exports: ["RABBITMQ_CONNECTION"],
})
export class RabbitMQModule {};
