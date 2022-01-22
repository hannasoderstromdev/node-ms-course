import { Request, Response, NextFunction } from "express";
import { RequestValidationError } from "../errors/request-validation-errors";
import { DatabaseConnectionError } from "../errors/database-connection-error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof RequestValidationError) {
    res.status(400).send({ errors: err.serializeErrors() });
  }

  if (err instanceof DatabaseConnectionError) {
    res.status(500).send({ errors: err.serializeErrors() });
  }

  res
    .status(500)
    .send({ errors: [{ message: err.message || "Something went wrong" }] });
};
