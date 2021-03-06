import mongoose from "mongoose";
import express, { Request, Response } from "express";
import {
  requireAuth,
  validateRequest,
  copy,
  NotFoundError,
  BadRequestError,
} from "@hs-tickets/common";
import { body } from "express-validator";

import { Ticket } from "../models/ticket";
import { Order, OrderStatus } from "../models/order";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage(copy.validation["ticket-id-invalid"]),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // Find ticket
    const ticketFound = await Ticket.findById(ticketId);

    if (!ticketFound) {
      throw new NotFoundError();
    }

    // Check availability
    const isReserved = await ticketFound.isReserved();

    if (isReserved) {
      throw new BadRequestError(copy.errors["ticket-reserved"]);
    }

    // Calculate expiry date
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build order and persist it
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: ticketFound,
    });

    await order.save();

    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticketFound.id,
        price: ticketFound.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as createOrderRouter };
