import { ValidationError } from "express-validator";

export class RequestValidationError extends Error {
  statusCode = 400;

  constructor(public errors: ValidationError[]) {
    super();

    // Add prototype to Error
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map((error) => ({
      message: error.msg,
      field: error.param,
    }));
  }
}
