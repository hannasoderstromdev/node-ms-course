import { queueGroupName } from "./queue-group-name";
import {
  ExpirationCompleteEvent,
  Listener,
  OrderStatus,
  Subjects,
} from "@hs-tickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  readonly queueGroupName = queueGroupName;

  async onMessage(
    data: ExpirationCompleteEvent["data"],
    msg: Message
  ): Promise<void> {
    const orderFound = await Order.findById(data.orderId).populate("ticket");

    if (!orderFound) {
      throw new Error("Order not found");
    }

    orderFound.set({ status: OrderStatus.Cancelled });
    await orderFound.save();

    await new OrderCancelledPublisher(this.client).publish({
      id: orderFound.id,
      version: orderFound.version,
      ticket: { id: orderFound.ticket.id },
    });

    msg.ack();
  }
}
