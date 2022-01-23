import request from "supertest";

import { app } from "../../app";

it("returns a 200 on successful signin", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({ email: "test@test.com", password: "password" })
    .expect(200);
});

it("sets a cookie after successful signin", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signin")
    .send({ email: "test@test.com", password: "password" })
    .expect(200);

  expect(response.get("Set-Cookie")).toBeDefined();
});

it("returns a 400 with an invalid email", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({ email: "test@", password: "password" })
    .expect(400);
});

it("returns a 400 with an invalid password", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({ email: "test@test.com", password: "123" })
    .expect(400);
});

it("returns a 400 with missing password ", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({ email: "test@test.com" })
    .expect(400);
});

it("returns a 400 with missing email", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({ password: "password" })
    .expect(400);
});

it("returns a 400 when email does not exist", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({ email: "test@test.com", password: "password" })
    .expect(400);
});

it("returns a 400 when password is incorrect", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({ email: "test@test.com", password: "wrongPass" })
    .expect(400);
});
