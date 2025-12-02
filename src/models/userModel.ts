import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobilenumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
    required: true,
    select:false
  },
  addresses: [
    {
      Receiver_Name: {
        type: String,
        required: true,
      },
      Receiver_MobileNumber: {
        type: String,
        required: true,
      },
      Address_Line1: {
        type: String,
        required: true,
      },
      Address_Line2: {
        type: String,
      },

      City: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
      label: {
        type: String,
        required: true,
      },
    },
  ],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

userSchema.index({ name: 1 });
userSchema.index({ mobilenumber: 1 }, { unique: true });

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;


