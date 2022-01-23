import { CustomError } from "./custom-error";
import copy from "../copy";

export class NotAuthorizedError extends CustomError {
  statusCode = 401;

  serializeErrors() {
    return [{ message: copy.errors["not-authorized"] }];
  }
}
