import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    orderBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            prodId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    // shippingAddress: {
    //     street: String,
    //     city: String,
    //     state: String,
    //     zipCode: String,
    //     country: String
    // },
    paymentMethod: String,
     paymentIntent: {
      id: {
        type: String,
      },
      method:{
        type: String, 
        enum: [
          "internet banking",
          "cod",
        ],
        default: "cod",
        required: true
    },
      amount: {
        type: Number,
        required: true
      },
      status: {
        type: String,
        enum: [
          "requires_payment_method",
          "requires_confirmation",
          "processing",
          "succeeded",
          "canceled",
        ],
        createdAt: {
        type: Date,
        default: Date.now
    },
      },
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;