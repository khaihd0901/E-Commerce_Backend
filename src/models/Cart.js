import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
    {
        orderBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [
            {
                prodId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
            },
        ],
        cartTotal: {
            type: Number,
            default: 0,
        },
        totalAfterDiscount: {
            type: Number,
        },
    },
    { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;