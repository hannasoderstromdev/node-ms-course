import { Listener, OrderCreatedEvent, Subjects } from "@hs-tickets/common";
import { Message } from "node-nats-streaming";

import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(
    data: OrderCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log("waiting to process for", delay);

    await expirationQueue.add(
      {
        orderId: data.id,
      }
      // {
      //   delay,
      // }
    );

    msg.ack();
  }
}
