// 🔹 Third-Party Module Imports (npm packages)
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// 🔹 Custom Module Imports
const { async_error_handler } = require("../utils/async_error_handler");

const user_schema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  referral_code: {
    type: String,
    unique: true,
  },
  referred_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  Balance: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

//password updates with its hash form before saving
user_schema.pre("save",async function(){
const user = this;

if(user.isModified("password") || user.isNew){
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password,salt);
}

})

const User = mongoose.model("User", user_schema);

module.exports = User;
