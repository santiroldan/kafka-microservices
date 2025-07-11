import {EventPublisher} from '../../domain/events/event-publisher';
import {Inject, Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {DomainEvent} from "../../domain/events/domain-event";

@Injectable()
export class KafkaEventPublisher implements EventPublisher, OnModuleInit, OnModuleDestroy {
    constructor(@Inject(process.env.KAFKA_NAME) private readonly kafka: ClientKafka) {}

    async onModuleInit() {
        await this.kafka.connect();
    }

    publish(event: DomainEvent): void {
        if (!event.getEventName()) {
            throw new Error('No se encontró topic en el evento');
        }

        this.kafka.emit(event.getEventName(), {
            eventName: event.getEventName(),
            occurredOn: event.getOccurredOn(),
            data: event.getPayload()
        });
    }

    async onModuleDestroy() {
        await this.kafka.close();
    }
}
