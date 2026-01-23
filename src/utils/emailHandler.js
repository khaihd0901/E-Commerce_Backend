import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
// Create a transporter
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,

    // user: 'khaihd0901@gmail.com',
    // pass: 'agsu lrej bmvt wyzi',
  },
});

// Send welcome email
export const sendWelcomeEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to our E-Commerce Store",
      html: `<h1>Welcome ${name}!</h1><p>Thank you for signing up.</p>`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
//send verification email
export const sendVerificationEmail = async (email, OTP) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `<h1>Verify Your Email</h1><p>This is your OTP code: <strong>${OTP}</strong></p>`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

//send verification email
export const sendAccountVerificationEmail = async (
  email,
  verifyLink,
  verifyExpireTime,
) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `<h1>Verify Your Email</h1>
            <h2>Warning if you do not verify your account it will be delete from our store</h2>
            <h2>Please verify your email by the link below before ${verifyExpireTime}</h2>
            <p>This is your link to verify your email: <strong>${verifyLink}</strong></p>`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Send password reset email
export const sendResetPasswordOTP = async (email, OTP) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password reset OTP",
      html: `<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>CodePen - OTP Email Template</title>
  

</head>
<body>
<!-- partial:index.partial.html -->
<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Koding 101</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing Koding 101. Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
    <p style="font-size:0.9em;">Regards,<br />Koding 101</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Koding 101 Inc</p>
      <p>1600 Amphitheatre Parkway</p>
      <p>California</p>
    </div>
  </div>
</div>
<!-- partial -->
  
</body>
</html>`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Send order confirmation email
export const sendOrderConfirmation = async (email, orderId, orderDetails) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Order Confirmation #${orderId}`,
      html: `<h1>Order Confirmed</h1><p>Order ID: ${orderId}</p><p>${orderDetails}</p>`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
