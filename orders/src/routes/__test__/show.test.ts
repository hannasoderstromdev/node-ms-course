import request from "supertest";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { getAuthCookie } from "../../test/getAuthCookie";

it("returns 401 for unauthorized user", async () => {
  await request(app)
    .get("/api/orders/61ffaffdd6bf0986ef007af3")
    .send()
    .expect(401);
});

it("returns 401 for wrong user", async () => {
  const ticket = Ticket.build({ title: "Title", price: 20 });
  await ticket.save();

  const userOne = getAuthCookie();
  const userTwo = getAuthCookie();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", userTwo)
    .send()
    .expect(401);
});

it("returns 404 on order not found", async () => {
  const user = getAuthCookie();
  await request(app)
    .get("/api/orders/61ffaffdd6bf0986ef007af3")
    .set("Cookie", user)
    .send()
    .expect(404);
});

it("returns 200 and the order", async () => {
  const ticket = Ticket.build({ title: "Title", price: 20 });
  await ticket.save();

  const user = getAuthCookie();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(order.id).toEqual(fetchedOrder.id);
});
