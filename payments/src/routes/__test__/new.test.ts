import request from "supertest";
import { OrderStatus } from "@hs-tickets/common";

import { getAuthCookie } from "./../../test/getAuthCookie";
import { getMongoId } from "../../test/getMongoId";
import { app } from "../../app";
import { Order } from "../../models/order";
import { stripe } from "../../stripe";

jest.mock("../../stripe");

it("returns 404 on charge of order that does not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", getAuthCookie())
    .send({ token: "fakeToken", orderId: getMongoId() })
    .expect(404);
});

it("returns 401 on charge of unauthorized order", async () => {
  const order = Order.build({
    id: getMongoId(),
    userId: getMongoId(),
    version: 0,
    price: 200,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", getAuthCookie())
    .send({ token: "fakeToken", orderId: order.id })
    .expect(401);
});

it("returns 400 on charge of cancelled order", async () => {
  const userId = getMongoId();
  const order = Order.build({
    id: getMongoId(),
    userId,
    version: 0,
    price: 200,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", getAuthCookie(userId))
    .send({ token: "fakeToken", orderId: order.id })
    .expect(400);
});

it("returns a 201 with valid inputs", async () => {
  const userId = getMongoId();
  const order = Order.build({
    id: getMongoId(),
    userId,
    version: 0,
    price: 200,
    status: OrderStatus.Created,
  });
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", getAuthCookie(userId))
    .send({ token: "tok_visa", orderId: order.id })
    .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual("tok_visa");
  expect(chargeOptions.amount).toEqual(order.price);
  expect(chargeOptions.currency).toEqual("usd");
});
