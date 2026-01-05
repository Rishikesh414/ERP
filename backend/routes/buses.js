// routes/buses.js
import express from "express";
import mongoose from "mongoose";
import { Bus } from "../models/Bus.js";
import { Branch } from "../models/Branch.js";

const router = express.Router();

/* ================= GET ALL BUSES FOR A BRANCH ================= */
// GET /api/buses/branch/:branchId
router.get("/branch/:branchId", async (req, res) => {
  try {
    const { branchId } = req.params;

    const buses = await Bus.find({ branch_id: branchId, isActive: true })
      .sort({ busId: 1 })
      .lean();

    res.json({
      success: true,
      count: buses.length,
      buses,
    });
  } catch (error) {
    console.error("Error fetching buses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch buses",
      error: error.message,
    });
  }
});

/* ================= GET SINGLE BUS ================= */
// GET /api/buses/:busId
router.get("/:busId", async (req, res) => {
  try {
    const { busId } = req.params;

    const bus = await Bus.findById(busId).lean();

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    res.json({
      success: true,
      bus,
    });
  } catch (error) {
    console.error("Error fetching bus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bus",
      error: error.message,
    });
  }
});

/* ================= CREATE NEW BUS ================= */
// POST /api/buses
router.post("/", async (req, res) => {
  try {
    const busData = req.body;

    // Validate branch_id is provided
    if (!busData.branch_id) {
      return res.status(400).json({
        success: false,
        message: "Branch ID is required",
      });
    }

    // Validate branch exists
    let branch;
    try {
      branch = await Branch.findById(busData.branch_id);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid Branch ID format",
      });
    }

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found. Please ensure you are logged in with a valid branch.",
      });
    }

    // Check if busId or registration number already exists
    const existing = await Bus.findOne({
      $or: [
        { busId: busData.busId },
        { registrationNumber: busData.registrationNumber },
      ],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Bus ID or Registration Number already exists",
      });
    }

    const newBus = new Bus({
      ...busData,
      institution_id: branch.institution_id,
    });

    await newBus.save();

    res.status(201).json({
      success: true,
      message: "Bus created successfully",
      bus: newBus,
    });
  } catch (error) {
    console.error("Error creating bus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create bus",
      error: error.message,
    });
  }
});

/* ================= UPDATE BUS ================= */
// PUT /api/buses/:busId
router.put("/:busId", async (req, res) => {
  try {
    const { busId } = req.params;
    const updateData = req.body;

    // Check if bus exists
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    // If updating busId or registration, check for duplicates
    if (updateData.busId || updateData.registrationNumber) {
      const existing = await Bus.findOne({
        _id: { $ne: busId },
        $or: [
          { busId: updateData.busId },
          { registrationNumber: updateData.registrationNumber },
        ],
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Bus ID or Registration Number already exists",
        });
      }
    }

    // Update the bus
    const updatedBus = await Bus.findByIdAndUpdate(
      busId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Bus updated successfully",
      bus: updatedBus,
    });
  } catch (error) {
    console.error("Error updating bus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update bus",
      error: error.message,
    });
  }
});

/* ================= ASSIGN/UPDATE DRIVER ================= */
// PUT /api/buses/:busId/driver
router.put("/:busId/driver", async (req, res) => {
  try {
    const { busId } = req.params;
    const { driverId, driverName, contactNumber, licenseNumber } = req.body;

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    bus.driver = {
      driverId,
      driverName,
      contactNumber,
      licenseNumber,
      assignmentStatus: driverName ? "Assigned" : "Not Assigned",
    };

    await bus.save();

    res.json({
      success: true,
      message: "Driver assigned successfully",
      bus,
    });
  } catch (error) {
    console.error("Error assigning driver:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign driver",
      error: error.message,
    });
  }
});

/* ================= UPDATE ROUTE ================= */
// PUT /api/buses/:busId/route
router.put("/:busId/route", async (req, res) => {
  try {
    const { busId } = req.params;
    const routeData = req.body;

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    bus.route = routeData;
    await bus.save();

    res.json({
      success: true,
      message: "Route updated successfully",
      bus,
    });
  } catch (error) {
    console.error("Error updating route:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update route",
      error: error.message,
    });
  }
});

/* ================= UPDATE MAINTENANCE ================= */
// PUT /api/buses/:busId/maintenance
router.put("/:busId/maintenance", async (req, res) => {
  try {
    const { busId } = req.params;
    const maintenanceData = req.body;

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    bus.maintenance = { ...bus.maintenance, ...maintenanceData };
    await bus.save();

    res.json({
      success: true,
      message: "Maintenance information updated successfully",
      bus,
    });
  } catch (error) {
    console.error("Error updating maintenance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update maintenance information",
      error: error.message,
    });
  }
});

/* ================= UPDATE STATUS ================= */
// PUT /api/buses/:busId/status
router.put("/:busId/status", async (req, res) => {
  try {
    const { busId } = req.params;
    const { operationalStatus, availability, busCondition } = req.body;

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    if (operationalStatus) bus.operationalStatus = operationalStatus;
    if (availability) bus.availability = availability;
    if (busCondition) bus.busCondition = busCondition;

    await bus.save();

    res.json({
      success: true,
      message: "Bus status updated successfully",
      bus,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update bus status",
      error: error.message,
    });
  }
});

/* ================= UPDATE SAFETY INFORMATION ================= */
// PUT /api/buses/:busId/safety
router.put("/:busId/safety", async (req, res) => {
  try {
    const { busId } = req.params;
    const safetyData = req.body;

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    bus.safety = { ...bus.safety, ...safetyData };
    await bus.save();

    res.json({
      success: true,
      message: "Safety information updated successfully",
      bus,
    });
  } catch (error) {
    console.error("Error updating safety:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update safety information",
      error: error.message,
    });
  }
});

/* ================= DEACTIVATE BUS ================= */
// DELETE /api/buses/:busId
router.delete("/:busId", async (req, res) => {
  try {
    const { busId } = req.params;

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    // Soft delete - set isActive to false
    bus.isActive = false;
    bus.operationalStatus = "Out of Service";
    await bus.save();

    res.json({
      success: true,
      message: "Bus deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating bus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate bus",
      error: error.message,
    });
  }
});

/* ================= GET BUSES STATISTICS ================= */
// GET /api/buses/branch/:branchId/stats
router.get("/branch/:branchId/stats", async (req, res) => {
  try {
    const { branchId } = req.params;

    const stats = await Bus.aggregate([
      { $match: { branch_id: new mongoose.Types.ObjectId(branchId), isActive: true } },
      {
        $facet: {
          total: [{ $count: "count" }],
          byStatus: [
            { $group: { _id: "$operationalStatus", count: { $sum: 1 } } },
          ],
          byCondition: [
            { $group: { _id: "$busCondition", count: { $sum: 1 } } },
          ],
          byAvailability: [
            { $group: { _id: "$availability", count: { $sum: 1 } } },
          ],
          withDriver: [
            {
              $match: { "driver.assignmentStatus": "Assigned" },
            },
            { $count: "count" },
          ],
          needsMaintenance: [
            {
              $match: {
                $or: [
                  { busCondition: "Needs Service" },
                  { operationalStatus: "Under Maintenance" },
                ],
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);

    res.json({
      success: true,
      stats: stats[0],
    });
  } catch (error) {
    console.error("Error fetching bus statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bus statistics",
      error: error.message,
    });
  }
});

export default router;
