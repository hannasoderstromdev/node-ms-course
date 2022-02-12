import { getAuthCookie } from "./../../test/getAuthCookie";
import request from "supertest";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";
import { getMongoId } from "../../test/getMongoId";

const natsWrapperSpy = jest.spyOn(natsWrapper.client, "publish");

it("returns 401 for unauthorized user", async () => {
  await request(app)
    .delete("/api/orders/61ffaffdd6bf0986ef007af3")
    .send()
    .expect(401);
});

it("returns 401 for wrong user", async () => {
  const ticket = Ticket.build({ title: "Title", price: 20, id: getMongoId() });
  await ticket.save();

  const userOne = getAuthCookie();
  const userTwo = getAuthCookie();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", userTwo)
    .send()
    .expect(401);
});

it("returns 404 on order not found", async () => {
  const user = getAuthCookie();
  await request(app)
    .delete("/api/orders/61ffaffdd6bf0986ef007af3")
    .set("Cookie", user)
    .send()
    .expect(404);
});

it("returns 204 on order cancelled", async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 20,
    id: getMongoId(),
  });
  await ticket.save();

  const user = getAuthCookie();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  const orderFound = await Order.findById(order.id);

  expect(orderFound?.status).toEqual(OrderStatus.Cancelled);
});

it("emits an order:cancelled event", async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 20,
    id: getMongoId(),
  });
  await ticket.save();

  const user = getAuthCookie();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
  expect(natsWrapperSpy.mock.calls[1][0]).toEqual("order:cancelled");
});
