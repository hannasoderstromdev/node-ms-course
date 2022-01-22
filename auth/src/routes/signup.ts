import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";

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
      throw new Error("Invalid email or password");
    }

    const { email, password } = req.body;

    console.log("Creating a user...");

    res.send({});
  }
);

export { router as signupRouter };
