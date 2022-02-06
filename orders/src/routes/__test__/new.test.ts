import request from "supertest";
import mongoose from "mongoose";
import { OrderStatus } from "@hs-tickets/common";

import { getAuthCookie } from "../../test/getAuthCookie";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order } from "../../models/order";

it("returns error 404 if ticket does not exist", async () => {
  const ticketId = new mongoose.Types.ObjectId();

  await request(app)
    .post("/api/orders")
    .set("Cookie", getAuthCookie())
    .send({ ticketId })
    .expect(404);
});

it("returns error 400 if ticket is reserved", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
  });

  await ticket.save();

  const order = Order.build({
    ticket,
    userId: "randomFakeId01",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });

  await order.save();

  await request(app)
    .post("/api/orders/")
    .set("Cookie", getAuthCookie())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("returns 201 when a ticket is successfully reserved", async () => {
  const title = "Concert";
  const price = 20;

  const ticket = Ticket.build({
    title,
    price,
  });
  await ticket.save();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", getAuthCookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(response.body).toEqual({
    __v: 0,
    expiresAt: expect.any(String),
    id: expect.any(String),
    status: "created",
    ticket: {
      __v: 0,
      id: expect.any(String),
      price,
      title,
    },
    userId: expect.any(String),
  });
});

it.todo("emits and order created event");
