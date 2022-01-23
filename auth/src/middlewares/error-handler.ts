import { Request, Response, NextFunction } from "express";

import copy from "../copy";
import { CustomError } from "../errors/custom-error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    res.status(400).send({ errors: err.serializeErrors() });
  }

  res.status(500).send({
    errors: [{ message: err.message || copy.errors["unknown-error"] }],
  });
};
