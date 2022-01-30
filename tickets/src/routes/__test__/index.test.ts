import { getAuthCookie } from "./../../test/getAuthCookie";
import request from "supertest";

import { app } from "../../app";

it("fetches a list of tickets", async () => {
  await request(app).post("/api/tickets").set("Cookie", getAuthCookie()).send({
    title: "Title One",
    price: 2000,
  });
  await request(app).post("/api/tickets").set("Cookie", getAuthCookie()).send({
    title: "Title Two",
    price: 3000,
  });

  const response = await request(app).get("/api/tickets").send().expect(200);

  expect(response.body.length).toEqual(2);
});
