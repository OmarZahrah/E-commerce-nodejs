const express = require("express");
const app = express();
const db = require("./db.js");
const userRouter = require("./router/user.js");
const productRouter = require("./router/product.js");
const cartRouter = require("./router/cart.js");
require("dotenv").config();
app.use(express.json());
const cors = require("cors");
const port = process.env.PORT;
app.use(cors());
// const userModel = require("./model/userModel.js");
// const cartModel = require("./model/cartModel.js");

app.use(express.static("public"));
app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/cart", cartRouter);
app.listen(port, () => {
  app.use((err, req, res, next) => {
    res.status(err.status).send({
      message: err.message,
      code: err.code,
    });
  });
  console.log(`App is listening on port ${port}`);
});
