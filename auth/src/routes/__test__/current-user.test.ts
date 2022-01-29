import request from "supertest";

import { getAuthCookie } from "./../../test/getAuthCookie";
import { app } from "../../app";

it("returns current user", async () => {
  const cookie = await getAuthCookie();

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(response.body).toEqual({
    currentUser: {
      email: "test@test.com",
      iat: expect.any(Number),
      id: expect.any(String),
    },
  });
});

it("responds with null if not authenticated", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
