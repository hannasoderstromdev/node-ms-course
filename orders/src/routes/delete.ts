import express, { Request, Response } from "express";
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
} from "@hs-tickets/common";

import { Order, OrderStatus } from "../models/order";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const orderFound = await Order.findById(orderId);

    if (!orderFound) {
      throw new NotFoundError();
    }

    if (orderFound.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    orderFound.status = OrderStatus.Cancelled;

    await orderFound.save();

    res.status(204).send({});
  }
);

export { router as deleteOrderRouter };
