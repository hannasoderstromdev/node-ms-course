import {
  OrderCancelledEvent,
  Subjects,
  Listener,
  OrderStatus,
} from "@hs-tickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  readonly queueGroupName = queueGroupName;

  async onMessage(
    data: OrderCancelledEvent["data"],
    msg: Message
  ): Promise<void> {
    const orderFound = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!orderFound) {
      throw new Error("Order not found");
    }

    orderFound.set({ status: OrderStatus.Cancelled });
    await orderFound.save();

    msg.ack();
  }
}
