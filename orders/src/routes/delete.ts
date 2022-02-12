import { OrderCancelledPublisher } from "./../events/publishers/order-cancelled-publisher";
import express, { Request, Response } from "express";
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
} from "@hs-tickets/common";

import { Order, OrderStatus } from "../models/order";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const orderFound = await Order.findById(orderId).populate("ticket");

    if (!orderFound) {
      throw new NotFoundError();
    }

    if (orderFound.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    orderFound.status = OrderStatus.Cancelled;

    await orderFound.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: orderFound.id,
      ticket: {
        id: orderFound.ticket.id,
      },
    });

    res.status(204).send({});
  }
);

export { router as deleteOrderRouter };
