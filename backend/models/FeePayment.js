const mongoose = require("mongoose");

const feePaymentSchema = new mongoose.Schema({
  institution_id: { type: mongoose.Schema.Types.ObjectId, ref: "Institution", required: true },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FeePayment", feePaymentSchema);
