const express = require("express");
const { check } = require("express-validator/check");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        // if (value === "test@test.com") {
        //   throw new Error("This email address is forbidden");
        // }
        // return true;
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("Email exists already.");
          }
        });
      }),
    check(
      "password",
      "Please enter a password with only numbers and text and have at least 5 characters"
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
    check("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match!");
      }
      return true;
    }),
  ],
  authController.postSignup
);

router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Please enter a valid email"),
    check(
      "password",
      "Please enter a password with only numbers and text and have at least 5 characters"
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
  ],
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password/", authController.postNewPassword);

module.exports = router;
