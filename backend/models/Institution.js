const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    institution_id: { type: String, required: true, unique: true },
    logo: String,
    location: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Institution", institutionSchema);
