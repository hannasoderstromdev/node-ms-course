import mongoose from "mongoose";
import request from "supertest";

import { app } from "../../app";
import { getAuthCookie } from "./../../test/getAuthCookie";
import { natsWrapper } from "../../nats-wrapper";

jest.mock("../../nats-wrapper.ts");

it("returns 404 if id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", getAuthCookie())
    .send({ title: "Title", price: 2000 })
    .expect(404);
});

it("returns 401 if not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: "New Title", price: 2001 })
    .expect(401);
});

it("returns 401 if user does not own the ticket", async () => {
  const cookieFirstUser = getAuthCookie();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookieFirstUser)
    .send({ title: "Title", price: 2000 });

  const cookieSecondUser = getAuthCookie();
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookieSecondUser)
    .send({ title: "new Title", price: 2001 })
    .expect(401);
});

it("returns 400 if title is invalid", async () => {
  const cookie = getAuthCookie();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "Title", price: 2000 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "", price: 2000 })
    .expect(400);
});

it("returns 400 if title is missing", async () => {
  const cookie = getAuthCookie();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "Title", price: 2000 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ price: 2000 })
    .expect(400);
});

it("returns 400 if price is invalid", async () => {
  const cookie = getAuthCookie();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "Title", price: 2000 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "New Title", price: -10 })
    .expect(400);
});

it("returns 400 if price is missing", async () => {
  const cookie = getAuthCookie();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "Title", price: 2000 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "New Title" })
    .expect(400);
});

it("returns 200 and updates ticket", async () => {
  const cookie = getAuthCookie();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "Title", price: 2000 })
    .expect(201);

  const updateResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "New Title", price: 2001 })
    .expect(200);

  expect(updateResponse.body.title).toEqual("New Title");
  expect(updateResponse.body.price).toEqual(2001);
});

it("publishes an event", async () => {
  const cookie = getAuthCookie();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "Title", price: 2000 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "New Title", price: 2001 })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
