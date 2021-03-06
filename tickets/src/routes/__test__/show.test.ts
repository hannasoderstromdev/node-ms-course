import request from "supertest";

import { app } from "../../app";
import { getAuthCookie } from "../../test/getAuthCookie";
import { getMongoId } from "./../../test/getMongoId";

jest.mock("../../nats-wrapper.ts");

it("returns 404 if ticket is not found", async () => {
  const id = getMongoId();

  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it("returns ticket if ticket is found", async () => {
  const title = "Title";
  const price = 2000;
  const { body } = await request(app)
    .post("/api/tickets")
    .set("Cookie", getAuthCookie())
    .send({ title, price })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
