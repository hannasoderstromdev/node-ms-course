import request from "supertest";
import mongoose from "mongoose";
import { OrderStatus } from "@hs-tickets/common";

import { getAuthCookie } from "../../test/getAuthCookie";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";
import { getMongoId } from "../../test/getMongoId";

it("returns error 404 if ticket does not exist", async () => {
  const ticketId = getMongoId();

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
    id: getMongoId(),
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
    id: getMongoId(),
  });
  await ticket.save();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", getAuthCookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(response.body).toEqual({
    version: 0,
    expiresAt: expect.any(String),
    id: expect.any(String),
    status: "created",
    ticket: {
      version: 0,
      id: expect.any(String),
      price,
      title,
    },
    userId: expect.any(String),
  });
});

it("emits and order created event", async () => {
  const title = "Concert";
  const price = 20;

  const ticket = Ticket.build({
    title,
    price,
    id: getMongoId(),
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", getAuthCookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
