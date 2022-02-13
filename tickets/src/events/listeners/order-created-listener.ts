import { Listener, OrderCreatedEvent, Subjects } from "@hs-tickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";

import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const ticketFound = await Ticket.findById(data.ticket.id);

    if (!ticketFound) {
      throw new Error("Ticket not found");
    }

    ticketFound.set({ orderId: data.id });
    await ticketFound.save();

    msg.ack();
  }
}
