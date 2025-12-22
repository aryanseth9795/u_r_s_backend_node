import { NextFunction, Request, Response } from "express";
import TryCatch from "../../utils/Trycatch.js";
import User from "../../models/userModel.js";
import ErrorHandler from "../../middlewares/ErrorHandler.js";

export const getUserDetails = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user;
    const user = await User.findById(id).lean();

    if (!user) return next(new ErrorHandler("No User Found", 404));
    res
      .status(200)
      .json({ success: true, message: "User Fetched Successfully", user });
  }
);

export const addAddress = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const {
      Receiver_Name,
      Receiver_MobileNumber,
      Address_Line1,
      Address_Line2,
      City,
      pincode,
      label,
    } = req.body;

    // Validation
    if (!userId) {
      return next(new ErrorHandler("User not authenticated", 401));
    }

    // Validate required fields
    if (
      !Receiver_Name ||
      !Receiver_MobileNumber ||
      !Address_Line1 ||
      !City ||
      !pincode ||
      !label
    ) {
      return next(
        new ErrorHandler(
          "Required fields: Receiver_Name, Receiver_MobileNumber, Address_Line1, City, pincode, label",
          400
        )
      );
    }

    // Create address object
    const newAddress = {
      Receiver_Name,
      Receiver_MobileNumber,
      Address_Line1,
      Address_Line2: Address_Line2 || "",
      City,
      pincode,
      label,
    };

    // Add address to user's addresses array
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { addresses: newAddress } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  }
);

export const editAddress = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { addressId } = req.params;
    const {
      Receiver_Name,
      Receiver_MobileNumber,
      Address_Line1,
      Address_Line2,
      City,
      pincode,
      label,
    } = req.body;

    // Validation
    if (!userId) {
      return next(new ErrorHandler("User not authenticated", 401));
    }

    if (!addressId) {
      return next(new ErrorHandler("Address ID is required", 400));
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Find address by _id
    const addressIndex = user.addresses.findIndex(
      (addr: any) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return next(new ErrorHandler("Address not found", 404));
    }

    // Update address fields (only update provided fields)
    if (Receiver_Name !== undefined)
      user.addresses[addressIndex].Receiver_Name = Receiver_Name;
    if (Receiver_MobileNumber !== undefined)
      user.addresses[addressIndex].Receiver_MobileNumber =
        Receiver_MobileNumber;
    if (Address_Line1 !== undefined)
      user.addresses[addressIndex].Address_Line1 = Address_Line1;
    if (Address_Line2 !== undefined)
      user.addresses[addressIndex].Address_Line2 = Address_Line2;
    if (City !== undefined) user.addresses[addressIndex].City = City;
    if (pincode !== undefined) user.addresses[addressIndex].pincode = pincode;
    if (label !== undefined) user.addresses[addressIndex].label = label;

    // Save user
    await user.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  }
);

export const deleteAddress = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { addressId } = req.params;

    // Validation
    if (!userId) {
      return next(new ErrorHandler("User not authenticated", 401));
    }

    if (!addressId) {
      return next(new ErrorHandler("Address ID is required", 400));
    }

    // Find user and remove address
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    ).select("-password");

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  }
);

// export const updateUserDetails=TryCatch(async()=>{})
