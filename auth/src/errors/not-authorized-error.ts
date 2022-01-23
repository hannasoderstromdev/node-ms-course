import { CustomError } from "./custom-error";
import copy from "../copy";

export class NotAuthorizedError extends CustomError {
  statusCode = 401;

  constructor() {
    super(copy.errors["not-authorized"]);

    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  serializeErrors() {
    return [{ message: copy.errors["not-authorized"] }];
  }
}
