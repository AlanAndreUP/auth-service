export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: string;
  public readonly eventType: string;

  constructor(eventType: string) {
    this.occurredOn = new Date();
    this.eventId = this.generateEventId();
    this.eventType = eventType;
  }

  private generateEventId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  abstract getAggregateId(): string;
}

export interface DomainEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

export class DomainEventDispatcher {
  private handlers: Map<string, DomainEventHandler<any>[]> = new Map();

  subscribe<T extends DomainEvent>(eventType: string, handler: DomainEventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const eventHandlers = this.handlers.get(event.eventType);
    if (eventHandlers) {
      const promises = eventHandlers.map(handler => handler.handle(event));
      await Promise.all(promises);
    }
  }
} 