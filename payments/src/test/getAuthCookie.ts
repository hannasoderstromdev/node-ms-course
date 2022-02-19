import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const getAuthCookie = (id?: string): string[] => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "fake@test.com",
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET!);

  const session = { jwt: token };

  const sessionAsJSON = JSON.stringify(session);

  const sessionAsBase64 = Buffer.from(sessionAsJSON).toString("base64");

  return [`session=${sessionAsBase64}`];
};
