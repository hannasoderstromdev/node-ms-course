import request from "supertest";

import { app } from "../../app";

it("returns a 201 on successful signup", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201);
});

it("returns a 400 with an invalid email", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@", password: "password" })
    .expect(400);
});

it("returns a 400 with an invalid password", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "123" })
    .expect(400);
});

it("returns a 400 with missing password ", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com" })
    .expect(400);

  expect(response.body).toEqual({
    errors: [
      {
        field: "password",
        message: "Please enter a password of at least 4 characters",
      },
    ],
  });
});

it("returns a 400 with missing email", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ password: "password" })
    .expect(400);
});

it("disallows duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201);

  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(400);
});

it("sets a cookie after successful signup", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201);

  expect(response.get("Set-Cookie")).toBeDefined();
});
