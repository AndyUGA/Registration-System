const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  data: {
    type: Date,
    default: Date.now
  },
  element3: {
    type: Array
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false
  },
  token: {
    type: String,
    required: true,
  }, 
  points: {
    type: Number,
    required:true, 
    default: 0
  }
});

const User = mongoose.model(process.env.collection, UserSchema);

module.exports = User;
