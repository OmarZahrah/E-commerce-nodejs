const express = require("express");
const router = express.Router();
const userModel = require("../models/User.js");
const CustomError = require("../CustomError.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { admin } = require("./checkToken.js");

// =================================================================================================
// =================================================================================================
//                             Sign up
// =================================================================================================
// =================================================================================================

router.post("/signup", async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      userName,
      password,
      email,
      phoneNumber,
      address,
      isAdmin,
    } = req.body;
    const takenUsername = await userModel.findOne({ userName });
    const emailCheck = await userModel.findOne({ email });
    if (takenUsername) {
      return next(
        CustomError({
          stateCod: 409,
          message: "This username is already taken try another one !",
        })
      );
    }
    if (emailCheck) {
      return next(
        CustomError({
          stateCod: 409,
          message: "This email is already Signed in !",
        })
      );
    }

    const newUser = new userModel({
      firstName,
      lastName,
      userName,
      password,
      email,
      isAdmin,
      phoneNumber,
      address,
    });

    await newUser.save();
    res.json({ message: "Signed up successfully" });
  } catch (err) {
    return next(
      CustomError({
        stateCod: 400,
        // message: "There was a problem signing up",
        message: err.message,
      })
    );
  }
});

// =================================================================================================
// =================================================================================================
//                                 Log in
// =================================================================================================
// =================================================================================================

router.post("/login", async (req, res, next) => {
  try {
    const { userName, password } = req.body;
    const user = await userModel.findOne({ userName });

    if (!user) {
      next(
        CustomError({
          stateCod: 404,
          message: "You have to sign up first.",
        })
      );
    }
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return next(
        CustomError({
          stateCod: 401,
          message: "Wrong username or password.",
        })
      );
    }
    const token = await user.genTok();
    res.json({ message: "logged in successfully", token });
  } catch (err) {
    next(
      CustomError({
        stateCod: 500,
        message: "There was a problem logging in",
      })
    );
  }
});

// =================================================================================================
// =================================================================================================
//                                 Get all
// =================================================================================================
// =================================================================================================

router.get("/getAll", admin, async (req, res, next) => {
  try {
    const allUsers = await userModel.find();
    res.status(200).send(allUsers);
  } catch (error) {
    next(
      CustomError({
        stateCod: 400,
        message: "There is no users",
      })
    );
  }
});

// =================================================================================================
// =================================================================================================
//                                 Update
// =================================================================================================
// =================================================================================================

router.patch("/edit/:id", async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      userName,
      password,
      email,
      isAdmin,
      phoneNumber,
      address,
    } = req.body;
    const id = req.params.id.trim();
    const takenUsername = await userModel.findOne({
      userName,
      _id: { $ne: id },
    });

    if (takenUsername) {
      return next(
        CustomError({
          stateCod: 409,
          message: "Username already taken",
        })
      );
    }

    const updates = {
      firstName,
      lastName,
      userName,
      email,
      isAdmin,
      phoneNumber,
      address,
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
    }

    const editUser = await userModel.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!editUser) {
      return next(
        CustomError({
          stateCod: 404,
          message: "User not found",
        })
      );
    }
    res.json({ editUser });
  } catch (error) {
    next(
      CustomError({
        stateCod: 500,
        message: "There is an error trying to edit",
      })
    );
  }
});

// =================================================================================================
// =================================================================================================
//                                Delete
// =================================================================================================
// =================================================================================================

router.delete("/delete/:id", admin, async (req, res, next) => {
  try {
    const deletedUser = await userModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "User deleted successfully",
    });

    // const token = await deletedUser.genTok();

    res.json({ message: "Deleted successfully" });
  } catch {
    next(
      CustomError({
        stateCod: 400,
        message: "can't delete",
      })
    );
  }
});

module.exports = router;
