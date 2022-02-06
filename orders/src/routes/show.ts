import express, { Request, Response } from "express";
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
} from "@hs-tickets/common";

import { Order } from "../models/order";

const router = express.Router();

router.get(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const orderFound = await Order.findById(req.params.orderId).populate(
      "ticket"
    );

    if (!orderFound) {
      throw new NotFoundError();
    }

    if (orderFound.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.send(orderFound);
  }
);

export { router as showOrderRouter };
