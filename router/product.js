const express = require("express");
const router = express.Router();
const userModel = require("../models/User.js");
const productModel = require("../models/Product.js");
const CustomError = require("../CustomError.js");
const bcrypt = require("bcrypt");
const util = require("util");
const jwt = require("jsonwebtoken");
const { admin } = require("./checkToken.js");

// =================================================================================================
// =================================================================================================
//                                 Add Product
// =================================================================================================
// =================================================================================================

router.post("/add", admin, async (req, res, next) => {
  try {
    const { name, description, price } = req.body;

    const newProduct = new productModel({
      name,
      description,
      price,
    });

    await newProduct.save();
    res.json({ message: "Product created successfully" });
  } catch (error) {
    next(
      CustomError({
        stateCod: 400,
        message: "There was an error creating the product",
      })
    );
  }
});

// =================================================================================================
// =================================================================================================
//                                get all products
// =================================================================================================
// =================================================================================================

router.get("/get", async (req, res, next) => {
  try {
    const allProducts = await productModel.find();
    res.status(200).send(allProducts);
  } catch (error) {
    next(
      CustomError({
        stateCod: 400,
        message: "There is no products",
      })
    );
  }
});

// =================================================================================================
// =================================================================================================
//                                 Edit Product
// =================================================================================================
// =================================================================================================

router.patch("/edit/:id", admin, async (req, res, next) => {
  try {
    const { name, description, price } = req.body;
    const id = req.params.id.trim();

    // const productCheck = await productModel.findOne({ name, _id: { $ne: id } });
    // const productCheck = await productModel.findById(id);
    // if (!productCheck) {
    //   return next(
    //     CustomError({
    //       stateCod: 409,
    //       message: "Product not found",
    //     })
    //   );
    // }

    const editProduct = await productModel.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
      },
      { new: true }
    );

    if (!editProduct) {
      return next(
        CustomError({
          stateCod: 404,
          message: "Product not found",
        })
      );
    }

    res.json({ message: "Successfully updated", editProduct });
  } catch (error) {
    next(
      CustomError({
        stateCod: 500,
        message: "there was a problem updating",
      })
    );
  }
});

// =================================================================================================
// =================================================================================================
//                                 Delete Product
// =================================================================================================
// =================================================================================================

router.delete("/delete/:id", admin, async (req, res, next) => {
  try {
    const deleted = await productModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch {
    next(
      CustomError({
        stateCod: 400,
        message: "faild to delete product",
      })
    );
  }
});

module.exports = router;
