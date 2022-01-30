import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
  copy,
} from "@hs-tickets/common";

import { Ticket } from "../models/ticket";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title")
      .not()
      .isEmpty()
      .withMessage(copy.validation["title-required"]),
    body("price").isInt({ gt: 0 }).withMessage(copy.validation["price-min"]),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const foundTicket = await Ticket.findById(req.params.id);

    if (!foundTicket) {
      throw new NotFoundError();
    }

    if (foundTicket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    foundTicket.set({
      title: req.body.title,
      price: req.body.price,
    });

    await foundTicket.save();

    res.send(foundTicket);
  }
);

export { router as updateTicketRouter };
