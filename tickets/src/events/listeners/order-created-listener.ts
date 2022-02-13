import { Listener, OrderCreatedEvent, Subjects } from "@hs-tickets/common";
import { Message } from "node-nats-streaming";

import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const ticketFound = await Ticket.findById(data.ticket.id);

    if (!ticketFound) {
      throw new Error("Ticket not found");
    }

    ticketFound.set({ orderId: data.id });
    await ticketFound.save();

    // Publish event with updated data
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticketFound.id,
      version: ticketFound.version,
      title: ticketFound.title,
      price: ticketFound.price,
      userId: ticketFound.userId,
      orderId: ticketFound.orderId,
    });

    msg.ack();
  }
}
