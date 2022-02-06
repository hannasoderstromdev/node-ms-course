import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@hs-tickets/common";

import { createOrderRouter } from "./routes/new";
import { deleteOrderRouter } from "./routes/delete";
import { showOrderRouter } from "./routes/show";
import { indexOrderRouter } from "./routes";

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
app.use(createOrderRouter);
app.use(deleteOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);

app.all("*", () => {
  throw new NotFoundError();
});

// Add error handler
app.use(errorHandler);

export { app };
