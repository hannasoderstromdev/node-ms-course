import request from "supertest";

import { getAuthCookie } from "../../test/getAuthCookie";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { getMongoId } from "../../test/getMongoId";

const buildTicket = async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 20,
    id: getMongoId(),
  });
  await ticket.save();

  return ticket;
};

it("returns 401 for unauthenticated user", async () => {});

it("returns all orders from the authenticated user", async () => {
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  const userOne = getAuthCookie();
  const userTwo = getAuthCookie();

  // User one
  await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  // User two
  const { body: orderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);
  const { body: orderTwo } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  // Make request to get orders for User #2
  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwo)
    .expect(200);

  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
