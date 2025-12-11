const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  institution_id: { type: mongoose.Schema.Types.ObjectId, ref: "Institution", required: true },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  name: { type: String, required: true }
});

module.exports = mongoose.model("Student", studentSchema);
