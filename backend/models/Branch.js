const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    institution_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true
    },
    branch_name: { type: String, required: true },
    location: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Branch", branchSchema);
