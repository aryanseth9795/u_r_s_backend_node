// import Order from "../models/orderModel.js";
// import mongoose from "mongoose";


// export const seedDummyOrders = async () => {
//   const now = new Date();
//   const statuses: ("Placed" | "Shipped" | "cancelled" | "delivered")[] = [
//     "Placed",
//     "Shipped",
//     "cancelled",
//     "delivered",
//   ];

//   const dummyOrders = Array.from({ length: 20 }).map((_, idx) => {
//     // spread orders across past 20 days
//     const createdAt = new Date(now);
//     createdAt.setDate(now.getDate() - idx);

//     const qty = (idx % 3) + 1; // 1–3
//     const pricePerItem = 150 + idx * 20;
//     const totalAmount = qty * pricePerItem;

//     return {
//       userId: new mongoose.Types.ObjectId(),
//       products: [
//         {
//           productId: new mongoose.Types.ObjectId(),
//           variantId: new mongoose.Types.ObjectId(),
//           quantity: qty,
//           price: pricePerItem,
//         },
//       ],
//       status: statuses[idx % statuses.length],
//       totalAmount,
//       address: {
//         Receiver_Name: `Test User ${idx + 1}`,
//         Receiver_MobileNumber: `999000${1000 + idx}`,
//         Address_Line1: `Street ${idx + 1}, Test Area`,
//         Address_Line2: `Near Landmark ${idx + 1}`,
//         City: idx % 2 === 0 ? "Mumbai" : "Delhi",
//         pincode: idx % 2 === 0 ? "400001" : "110001",
//         label: idx % 2 === 0 ? "Home" : "Office",
//       },
//       createdAt,
//       updatedAt: createdAt,
//     };
//   });

//   await Order.insertMany(dummyOrders);
//   console.log("✅ 20 dummy orders inserted");
// };