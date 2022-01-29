import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { BadRequestError } from "@hs-tickets/common";
import { validateRequest } from "@hs-tickets/common";
import { User } from "../models/user";
import { copy } from "@hs-tickets/common";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage(copy.validation["email-invalid"]),
    body("password")
      .trim()
      .isLength({ min: 4 })
      .withMessage(copy.validation["password-min"]),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError(copy.validation["email-in-use"], "email");
    }

    const user = User.build({ email, password });
    await user.save();

    // generate JWT
    const userJWT = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET! // ! tells TS to ignore this
    );

    // store in session
    req.session = {
      jwt: userJWT,
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
