import mongoose from 'mongoose';

const openingHoursSchema = new mongoose.Schema({
  open: {
    type: String,
    required: true,
    default: '09:00'
  },
  close: {
    type: String,
    required: true,
    default: '18:00'
  },
  isOpen: {
    type: Boolean,
    default: true
  }
});

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'My First Restaurant'
  },
  description: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: 'your@restaurant.com'
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    default: 'default'
  },
  openingHours: {
    monday: { 
      type: openingHoursSchema,
      default: { open: '09:00', close: '18:00', isOpen: true }
    },
    tuesday: { 
      type: openingHoursSchema,
      default: { open: '09:00', close: '18:00', isOpen: true }
    },
    
    wednesday: { 
      type: openingHoursSchema,
      default: { open: '09:00', close: '18:00', isOpen: true }
    },
    thursday: { 
      type: openingHoursSchema,
      default: { open: '09:00', close: '18:00', isOpen: true }
    },
    friday: { 
      type: openingHoursSchema,
      default: { open: '09:00', close: '18:00', isOpen: true }
    },
    saturday: { 
      type: openingHoursSchema,
      default: { open: '09:00', close: '18:00', isOpen: false }
    },
    sunday: { 
      type: openingHoursSchema,
      default: { open: '09:00', close: '18:00', isOpen: false }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

restaurantSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model('Restaurant', restaurantSchema);