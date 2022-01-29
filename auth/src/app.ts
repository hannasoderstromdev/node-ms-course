import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";

import { errorHandler } from "@hs-tickets/common";
import { NotFoundError } from "@hs-tickets/common";

const app = express();
app.set("trust proxy", true); // Allow ingress to be proxy

app.use(json());
app.use(
  cookieSession({
    signed: false, // not needed for JWT
    secure: process.env.NODE_ENV !== "test", // adds SSL (if not in test env)
  })
);

// Add routing
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all("*", () => {
  throw new NotFoundError();
});

// Add error handler
app.use(errorHandler);

export { app };
