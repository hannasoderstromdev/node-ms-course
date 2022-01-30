import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@hs-tickets/common";

import { createTicketRouter } from "./routes/new";
import { updateTicketRouter } from "./routes/update";
import { showTicketRouter } from "./routes/show";
import { indexTicketRouter } from "./routes";

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
app.use(createTicketRouter);
app.use(updateTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);

app.all("*", () => {
  throw new NotFoundError();
});

// Add error handler
app.use(errorHandler);

export { app };
