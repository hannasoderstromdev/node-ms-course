import { Listener, OrderCancelledEvent, Subjects } from "@hs-tickets/common";
import { Message } from "node-nats-streaming";

import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  readonly queueGroupName = queueGroupName;

  async onMessage(
    data: OrderCancelledEvent["data"],
    msg: Message
  ): Promise<void> {
    const ticketFound = await Ticket.findById(data.ticket.id);

    if (!ticketFound) {
      throw new Error("Ticket not found");
    }

    ticketFound.set({ orderId: undefined });

    await ticketFound.save();

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
