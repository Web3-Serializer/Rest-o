import mongoose from 'mongoose';
import User from './User.js';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    default: function () {
      return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    },
  },
  items: [{
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
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
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  tableNumber: {
    type: String
  },
  customerName: {
    type: String
  },
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  if (!this.customerName && this.createdBy) {
    try {
      const user = await User.findById(this.createdBy);
      if (user) {
        this.customerName = user.name;
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});

export default mongoose.model('Order', orderSchema);