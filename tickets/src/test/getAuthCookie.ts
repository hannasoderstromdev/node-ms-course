import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const getAuthCookie = (): string[] => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const payload = {
    id,
    email: "fake@test.com",
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET!);

  const session = { jwt: token };

  const sessionAsJSON = JSON.stringify(session);

  const sessionAsBase64 = Buffer.from(sessionAsJSON).toString("base64");

  return [`session=${sessionAsBase64}`];
};
