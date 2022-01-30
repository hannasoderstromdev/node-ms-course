import jwt from "jsonwebtoken";

export const getAuthCookie = () => {
  const payload = {
    id: "fakeId",
    email: "fake@test.com",
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET!);

  const session = { jwt: token };

  const sessionAsJSON = JSON.stringify(session);

  const sessionAsBase64 = Buffer.from(sessionAsJSON).toString("base64");

  return [`session=${sessionAsBase64}`];
};
