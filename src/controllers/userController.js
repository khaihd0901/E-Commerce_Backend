import User from "../models/User.js";
import Product from "../models/Product.js";
import Session from "../models/Session.js";
import { sendResetEmail } from "../utils/emailHandler.js";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";

// CREATE user
// export const createUser = async (req, res) => {
//   try {
//     const user = await User.create(req.body);
//     res.status(201).json({
//       success: true,
//       data: user
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// READ all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-hashedPassword");
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// READ single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-hashedPassword");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE user
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { _id } = req.user;
    const { password } = req.body;
    const token = req.cookies?.refreshToken;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (password) {
      user.password = password;
      const updatedPassword = await user.save();
      if (token) {
        // delete refresstoken in database
        await Session.deleteOne({ refreshToken: token });
        // delete cookie
        res.clearCookie("refreshToken");
      }

      res.json(updatedPassword);
      return res.sendStatus(204);
    } else {
      res.json(user);
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Generate password reset token
    const resetToken = await user.createPasswordResetToken();
    await user.save();
    const resetUrl = `Hi, Please click on this link to reset your password, this link is valid for 10 minutes: http://localhost:5001/api/user/reset-password/${resetToken}`;
    const data = {
      to: email,
      text: "Hello, User",
      subject: "Password Reset Link",
      html: resetUrl,
    };
    sendResetEmail(email, data);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    // const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    // console.log(hashedToken)
    const user = await User.findOne({
      passWordResetToken: token,
      passWordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password;
    user.passWordResetToken = undefined;
    user.passWordResetExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const getWishlist = async (req, res) => {
  const { _id } = req.user;
  try {
    const wishList = await User.findById(_id).select("wishList");
    res.status(200).json(wishList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const userCart = async (req, res) => {
  const { _id } = req.user;
  const { cart } = req.body;
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let products = [];
    const alreadyExist = await Cart.findOne({ orderBy: user._id });
    if (alreadyExist) {
      await alreadyExist.deleteOne();
    }
    if (alreadyExist?.cart?.length > 0) {
      alreadyExist.cart = [];
      await alreadyExist.save();
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.prodId = cart[i].prodId;
      object.quantity = cart[i].quantity;
      let getPrice = await Product.findById(cart[i].prodId)
        .select("price")
        .exec();
      object.price = getPrice?.price;
      products.push(object);
    }

    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal += products[i].price * products[i].quantity;
    }
    let newCart = await new Cart({
      orderBy: user?._id,
      items: products,
      cartTotal: cartTotal,
    }).save();
    // await User.findByIdAndUpdate(_id, {cart: newCart.items}, {new: true});
    res.status(200).json(newCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserCart = async (req, res) => {
  const { _id } = req.user;
  console.log(_id);
  try {
    const cart = await Cart.findOne({ orderBy: _id }).populate("items.prodId");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const emptyCart = async (req, res) => {
  const { _id } = req.user;
  try {
    await Cart.findOneAndRemove({ userId: _id });
    res.status(200).json({
      success: true,
      message: "Cart emptied successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const applyCoupon = async (req, res) => {
  const { _id } = req.user;
  const { coupon } = req.body;
  try {
    const validCoupon = await Coupon.findOne({ code: coupon });
    console.log(validCoupon);

    if (
      validCoupon === null ||
      validCoupon.isActive === false ||
      validCoupon.expiryDate < new Date()
    ) {
      return res.status(404).json({ message: "Invalid coupon" });
    }
    const user = await User.findOne({ _id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let { cartTotal } = await Cart.findOne({ userId: user._id }).populate(
      "items.prodId",
    );

    if (cartTotal < validCoupon.minPurchaseAmount) {
      return res.status(400).json({
        message:
          "Cart total is less than minimum purchase accept for this coupon is: " +
          validCoupon.minPurchaseAmount,
      });
    }
    let totalAfterDiscount = (
      cartTotal -
      (cartTotal * validCoupon.discountValue) / 100
    ).toFixed(2);
    await Cart.findOneAndUpdate(
      { userId: user._id },
      { totalAfterDiscount },
      { new: true },
    );
    res.status(200).json({ totalAfterDiscount });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createOrder = async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;

  try {
    if (!COD) throw new Error("Create cash Order failed");

    const userCart = await Cart.findOne({ orderBy: _id });
    if (!userCart) throw new Error("Cart not found");

    const finalAmount =
      couponApplied && userCart.totalAfterDiscount
        ? userCart.totalAfterDiscount
        : userCart.cartTotal;

    await Order.create({
      orderBy: _id,
      items: userCart.items,
      totalAmount: finalAmount,
      paymentIntent: {
        amount: finalAmount,
        status: "processing",
        method: "cod",
      },
    });

    userCart.items.map((i) => console.log(i.prodId));
    let update = userCart.items.map((i) => {
      const count = Number(i.quantity);
      if (!Number.isFinite(count)) {
        throw new Error(`Invalid count for product ${i.prodId}`);
      }
      return {
        updateOne: {
          filter: { _id: i.prodId },
          update: {
            $inc: {
              stock: -count,
              sold: +count
            },
          },
        },
      };
    });
    await Product.bulkWrite(update);

    res.json({ message: "success" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getOrderbyUser = async (req, res) => {
  const { _id } = req.user;
  console.log('id in get order', _id)
  try {
    const order = await Order.findOne({ orderBy: _id })
      .populate("items.prodId")
      .populate("orderBy")
      .exec();
    res.json(order);
  } catch (err) {
    throw new Error(err);
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('orderBy');
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        status: status,
      },
      { new: true },
    );
    res.json(updateOrderStatus);
  } catch (err) {
    throw new Error(err);
  }
};
