const express = require("express");
const { check } = require("express-validator");

const adminController = require("../controllers/admin");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/add-product", isAuth, adminController.getAddProduct);

router.get("/products", isAuth, adminController.getProducts);

router.post(
  "/add-product",
  isAuth,
  [
    check("title")
      .isString()
      .withMessage("Title must be alphanumeric")
      .isLength({ min: 3 })
      .trim()
      .withMessage("Title must have at least 3 characters"),
    check("price")
      .isFloat()
      .withMessage("Please enter a floating number: 12.99$"),
    check("description").isLength({ min: 5, max: 255 }).trim(),
  ],
  adminController.postAddProduct
);

router.get("/edit-product/:id", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  isAuth,
  [
    check("title")
      .isString()
      .withMessage("Title must be alphanumeric")
      .isLength({ min: 3 })
      .trim()
      .withMessage("Title must have at least 3 characters"),
    check("price")
      .isFloat()
      .withMessage("Please enter a floating number: 12.99$"),
    check("description").isLength({ min: 5, max: 255 }).trim(),
  ],
  adminController.postEditProduct
);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
