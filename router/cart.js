const express = require("express");
const router = express.Router();
const userModel = require("../models/User.js");
const productModel = require("../models/Product.js");
const cartModel = require("../models/Cart.js");
const CustomError = require("../CustomError.js");

const jwt = require("jsonwebtoken");

const util = require("util");
const secretKey = process.env.secret_Key;
const asyncverify = util.promisify(jwt.verify);
// =================================================================================================
// =================================================================================================
//                                 Add to cart
// =================================================================================================
// =================================================================================================

router.post("/add", async (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return next(
        CustomError({
          statusCode: 401,
          message: "You should log in first!",
        })
      );
    }

    const { userId, productId } = req.body;
    const decoded = await asyncverify(token, secretKey);
    if (decoded.id !== userId) {
      return next(
        CustomError({
          statusCode: 401,
          message: "you are not authorized!",
        })
      );
    }

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let order = await cartModel.findOne({ userId: user._id });

    if (!order) {
      order = new cartModel({
        userId: user._id,
        items: [],
        totalPrice: 0,
      });
    }
    const itemInCart = order.items.find((item) =>
      item.product.equals(product._id)
    );

    if (itemInCart) {
      itemInCart.quantity += 1;
      order.totalPrice += product.price;
    } else {
      order.items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
      order.totalPrice += product.price;
    }

    await order.save();

    res.json({ message: "Added to cart", cart: order });
  } catch (error) {
    next(
      CustomError({
        statusCod: 400,
        message: "There was an error adding the order to  cart",
      })
    );
  }
});

// =================================================================================================
// =================================================================================================
//                                Get cart
// =================================================================================================
// =================================================================================================

router.get("/get/:userId", async (req, res, next) => {
  try {
    const { token } = req.headers;

    const { userId } = req.params;
    const decoded = await asyncverify(token, secretKey);
    if (decoded.id !== userId) {
      return next(
        CustomError({
          statusCode: 401,
          message: "you are not authorized!",
        })
      );
    }
    const cartData = await cartModel.findOne({ userId });
    if (!cartData) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.json({
      cartData,
    });
  } catch (error) {
    next(
      CustomError({
        stateCod: 400,
        message: "There is a problem getting your cart!",
      })
    );
  }
});

// =================================================================================================
// =================================================================================================
//                                Delete item
// =================================================================================================
// =================================================================================================

router.delete("/remove/:userId", async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return next(
        CustomError({
          statusCode: 401,
          message: "You should log in first!",
        })
      );
    }
    const { userId } = req.params;
    const { productId } = req.body;

    const decoded = await asyncverify(token, secretKey);
    if (decoded.id !== userId) {
      return next(
        CustomError({
          statusCode: 401,
          message: "you are not authorized!",
        })
      );
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const order = await cartModel.findOne({ userId: user._id });

    if (!order) {
      return res.status(404).json({ message: "Cart not found!" });
    }
    const itemIndex = order.items.findIndex(
      (item) => item.product.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in the cart" });
    }
    order.items.splice(itemIndex, 1);
    await order.save();

    res.json({
      message: "Product removed from cart successfully",
      cart: order,
    });
  } catch (error) {
    next(
      CustomError({
        statusCode: 500,
        message: "Internal server error",
      })
    );
  }
});

// =================================================================================================
// =================================================================================================
//                                 Clear Cart
// =================================================================================================
// =================================================================================================

router.delete("/clear/:userId", async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return next(
        CustomError({
          statusCode: 401,
          message: "You should log in first!",
        })
      );
    }
    const { userId } = req.params;

    const decoded = await asyncverify(token, secretKey);
    if (decoded.id !== userId) {
      return next(
        CustomError({
          statusCode: 401,
          message: "you are not authorized!",
        })
      );
    }
    const cartData = await cartModel.findOneAndDelete(userId);
    if (!cartData) {
      return res.status(404).json({ message: "Cart not found!" });
    }
    res.json({
      message: "Cart successfully deleted",
    });
  } catch (error) {
    next(
      CustomError({
        stateCod: 400,
        message: "There is a problem deleting your cart!",
      })
    );
  }
});

module.exports = router;
