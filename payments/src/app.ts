import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@hs-tickets/common";

import { createChargeRouter } from "./routes/new";

const app = express();
app.set("trust proxy", true); // Allow ingress to be proxy

app.use(json());
app.use(
  cookieSession({
    signed: false, // not needed for JWT
    secure: process.env.NODE_ENV !== "test", // adds SSL (if not in test env)
  })
);
app.use(currentUser);

// Add routing
app.use(createChargeRouter);

app.all("*", () => {
  throw new NotFoundError();
});

// Add error handler
app.use(errorHandler);

export { app };
