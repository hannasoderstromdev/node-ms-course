import copy from "../copy";
import { CustomError } from "./custom-error";

export class DatabaseConnectionError extends CustomError {
  statusCode = 500;
  reason = copy.errors["db-connect-error"];

  constructor() {
    super(copy.errors["db-connect-error"]);

    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
