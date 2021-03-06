import request from "supertest";

import { app } from "../../app";
import { getAuthCookie } from "../../test/getAuthCookie";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "./../../nats-wrapper";

jest.mock("../../nats-wrapper.ts");

it("has a route-handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("returns 401 if user is not signed in", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).toEqual(401);
});

it("returns anything but 401 when user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", getAuthCookie())
    .send({});

  expect(response.status).not.toEqual(401);
});

it("returns an error if title is empty", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", getAuthCookie())
    .send({
      title: "",
      price: 10,
    });

  expect(response.status).toEqual(400);
  expect(response.body).toEqual({
    errors: [{ field: "title", message: "Please enter a title" }],
  });
});

it("returns an error if title is missing", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", getAuthCookie())
    .send({
      price: 10,
    });

  expect(response.status).toEqual(400);
  expect(response.body).toEqual({
    errors: [{ field: "title", message: "Please enter a title" }],
  });
});

it("returns an error if price is less than zero", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", getAuthCookie())
    .send({
      title: "Title",
      price: -10,
    });

  expect(response.status).toEqual(400);
  expect(response.body).toEqual({
    errors: [
      { field: "price", message: "Please enter a price greater than zero" },
    ],
  });
});

it("returns an error if price missing", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", getAuthCookie())
    .send({
      title: "Title",
    });

  expect(response.status).toEqual(400);
  expect(response.body).toEqual({
    errors: [
      { field: "price", message: "Please enter a price greater than zero" },
    ],
  });
});

it("returns 201 when creating a ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", getAuthCookie())
    .send({ title: "Title", price: 2000 });

  expect(response.status).toEqual(201);
});

it("creates a new ticket in the database", async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title = "Title";
  const price = 2000;

  await request(app)
    .post("/api/tickets")
    .set("Cookie", getAuthCookie())
    .send({ title, price });

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual(title);
  expect(tickets[0].price).toEqual(price);
});

it("publishes an event", async () => {
  const title = "Title";

  await request(app)
    .post("/api/tickets")
    .set("Cookie", getAuthCookie())
    .send({ title, price: 20 })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
