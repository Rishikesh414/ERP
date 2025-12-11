const express = require("express");
const Institution = require("../models/Institution");
const User = require("../models/User");
const Branch = require("../models/Branch"); // <-- add this

const router = express.Router();

/* ----- DASHBOARD ROUTE ----- */
router.get("/dashboard", async (req, res) => {
  try {
    const totalInstitutions = await Institution.countDocuments({});
    const totalBranches = await Branch.countDocuments({});

    console.log("DASHBOARD COUNTS:", {
      institutions: totalInstitutions,
      branches: totalBranches
    });

    const branchList = await Branch.find({})
      .populate("institution_id", "name")
      .sort({ createdAt: -1 })
      .limit(20);

    const branches = (branchList || []).map((b) => ({
      id: b._id,
      name: b.branch_name,
      institutionName: b.institution_id?.name || ""
    }));

    res.json({
      totals: {
        institutions: totalInstitutions,
        branches: totalBranches,
        students: 0,
        feeCollected: 0
      },
      branches,
      recentActivities: []
    });
  } catch (err) {
    console.error("COMPANY DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ----- INSTITUTIONS CRUD ----- */
router.get("/institutions", async (req, res) => {
  const list = await Institution.find({}).sort({ createdAt: -1 });
  res.json(list);
});

router.post("/institutions", async (req, res) => {
  try {
    const inst = new Institution(req.body);
    await inst.save();
    res.status(201).json(inst);
  } catch (err) {
    console.error("CREATE INSTITUTION ERROR:", err);
    res.status(400).json({ message: "Could not create institution" });
  }
});

router.put("/institutions/:id", async (req, res) => {
  try {
    const inst = await Institution.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    res.json(inst);
  } catch (err) {
    console.error("UPDATE INSTITUTION ERROR:", err);
    res.status(400).json({ message: "Could not update institution" });
  }
});

router.delete("/institutions/:id", async (req, res) => {
  try {
    await Institution.findByIdAndDelete(req.params.id);
    res.json({ message: "Institution deleted" });
  } catch (err) {
    console.error("DELETE INSTITUTION ERROR:", err);
    res.status(400).json({ message: "Could not delete institution" });
  }
});

/* ----- INSTITUTION ADMINS (SUPER ADMINS) CRUD ----- */
router.get("/admins", async (req, res) => {
  const admins = await User.find({ role: "institution_admin" })
    .populate("institution_id", "name")
    .sort({ createdAt: -1 });
  res.json(admins);
});

router.post("/admins", async (req, res) => {
  try {
    const { name, email, phone, institution_id } = req.body;

    const user = new User({
      name,
      email,
      phone,
      role: "institution_admin",
      institution_id,
      status: "active"
    });
    await user.setPassword("Admin@123");
    await user.save();

    const populated = await user.populate("institution_id", "name");
    res.status(201).json(populated);
  } catch (err) {
    console.error("CREATE ADMIN ERROR:", err);
    res.status(400).json({ message: "Could not create admin" });
  }
});

router.put("/admins/:id", async (req, res) => {
  try {
    const { name, email, phone, institution_id, status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, institution_id, status },
      { new: true }
    ).populate("institution_id", "name");
    res.json(user);
  } catch (err) {
    console.error("UPDATE ADMIN ERROR:", err);
    res.status(400).json({ message: "Could not update admin" });
  }
});

router.delete("/admins/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Admin deleted" });
  } catch (err) {
    console.error("DELETE ADMIN ERROR:", err);
    res.status(400).json({ message: "Could not delete admin" });
  }
});

module.exports = router;
