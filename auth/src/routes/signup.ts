import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-errors";
import { DatabaseConnectionError } from "../errors/database-connection-error";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Enter a valid e-mail"),
    body("password")
      .trim()
      .isLength({ min: 4 })
      .withMessage("Enter a password of at least 4 characters"),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }

    const { email, password } = req.body;

    console.log("Creating a user...");

    // throw new DatabaseConnectionError();

    res.send({});
  }
);

export { router as signupRouter };
