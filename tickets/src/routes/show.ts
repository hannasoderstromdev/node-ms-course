import { NotFoundError } from "@hs-tickets/common";
import express, { Request, Response } from "express";

import { Ticket } from "../models/ticket";

const router = express.Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  const ticketFound = await Ticket.findById(req.params.id);

  if (!ticketFound) {
    throw new NotFoundError();
  }

  res.send(ticketFound);
});

export { router as showTicketRouter };
