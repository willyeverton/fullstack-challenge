export interface UserCreatedEvent {
  uuid: string;
  name: string;
  email: string;
}

export interface IMessageHandler {
  handleUserCreated(data: UserCreatedEvent): Promise<void>;
  retryMessage(data: UserCreatedEvent, retryCount: number): Promise<void>;
  sendToDLQ(data: UserCreatedEvent, error: Error): Promise<void>;
} 