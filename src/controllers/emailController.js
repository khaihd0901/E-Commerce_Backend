import nodemailer from 'nodemailer';
// Create a transporter
export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        // user: process.env.EMAIL_USER,
        // pass: process.env.EMAIL_PASSWORD,

        user: 'khaihd0901@gmail.com',
        pass: 'agsu lrej bmvt wyzi',
    },
});

// Send welcome email
export const sendWelcomeEmail = async (email, name) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to our E-Commerce Store',
            html: `<h1>Welcome ${name}!</h1><p>Thank you for signing up.</p>`,
        });
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
//send verification email
export const sendVerificationEmail = async (email, OTP) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Email',
            html: `<h1>Verify Your Email</h1><p>This is your OTP code: <strong>${OTP}</strong></p>`,
        });
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

// Send password reset email
export const sendResetEmail = async (email, data) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            data
        });
    } catch (error) {
        console.error('Error sending email:', error);
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
        console.error('Error sending email:', error);
        throw error;
    }
};
