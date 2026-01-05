import React, { useState, useEffect } from "react";
import "./styles/Buses.css";

export default function Buses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("list"); // list, add, details

  const branchId = localStorage.getItem("branchId");

  const [formData, setFormData] = useState({
    // Basic Information
    busId: "",
    registrationNumber: "",
    busType: "Standard bus",
    model: "",
    capacity: "",
    buildYear: "",
    busStatus: "Active",
    availability: "Available",

    // Driver Information
    driver: {
      driverName: "",
      driverContact: "",
      driverImage: "",
      licenseNumber: "",
    },

    // Staff Information
    staff: {
      staffName: "",
      staffContact: "",
    },

    // Custom Fields
    customFields: [],

    // Route Information
    route: {
      routeName: "",
      stops: [],
      totalDistance: "",
      distanceUnit: "km",
      parkingPlace: {
        name: "",
        address: "",
      },
    },

    // Safety Information
    safety: {
      firstAidKit: false,
      fireExtinguisher: false,
      emergencyContactNumber: "",
      gpsInstalled: false,
      cctv: false,
      seatBelts: false,
      speedGovernor: false,
    },

    // Maintenance Information
    maintenance: {
      lastServiceDate: "",
      nextServiceDate: "",
      pollutionCertificate: {
        fileName: "",
        fileData: "",
        expiryDate: "",
        lastUpdatedDate: "",
      },
      fitnessCertificate: {
        fileName: "",
        fileData: "",
        expiryDate: "",
        lastUpdatedDate: "",
      },
      permit: {
        fileName: "",
        fileData: "",
      },
      maintenanceNotes: "",
    },

    remarks: "",
  });

  useEffect(() => {
    if (!branchId) {
      alert("Branch ID not found. Please login again.");
      return;
    }
    fetchBuses();
    fetchStats();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/buses/branch/${branchId}`);
      const data = await response.json();
      if (data.success) {
        setBuses(data.buses);
      } else {
        console.error("Failed to fetch buses:", data.message);
      }
    } catch (error) {
      console.error("Error fetching buses:", error);
      alert("Failed to fetch buses. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/buses/branch/${branchId}/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleInputChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    const actualValue = type === "checkbox" ? checked : value;

    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: actualValue,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: actualValue,
      }));
    }
  };

  // Handle nested object changes (e.g., parking place)
  const handleNestedChange = (e, section, nestedField) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedField]: {
          ...prev[section][nestedField],
          [name]: value,
        },
      },
    }));
  };

  // Add new stop
  const addStop = () => {
    setFormData(prev => ({
      ...prev,
      route: {
        ...prev.route,
        stops: [...prev.route.stops, { stopName: "", timing: "" }],
      },
    }));
  };

  // Remove stop
  const removeStop = (index) => {
    setFormData(prev => ({
      ...prev,
      route: {
        ...prev.route,
        stops: prev.route.stops.filter((_, i) => i !== index),
      },
    }));
  };

  // Update stop
  const updateStop = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      route: {
        ...prev.route,
        stops: prev.route.stops.map((stop, i) =>
          i === index ? { ...stop, [field]: value } : stop
        ),
      },
    }));
  };

  // Add custom field
  const addCustomField = () => {
    setFormData(prev => ({
      ...prev,
      customFields: [...prev.customFields, { fieldName: "", fieldValue: "" }],
    }));
  };

  // Remove custom field
  const removeCustomField = (index) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  };

  // Update custom field
  const updateCustomField = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.map((cf, i) =>
        i === index ? { ...cf, [field]: value } : cf
      ),
    }));
  };

  // Handle file upload for PDFs
  const handleFileUpload = (e, certificateType) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please upload only PDF files");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File size should not exceed 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setFormData(prev => ({
          ...prev,
          maintenance: {
            ...prev.maintenance,
            [certificateType]: {
              ...prev.maintenance[certificateType],
              fileName: file.name,
              fileData: base64,
              uploadDate: new Date().toISOString(),
            },
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle certificate date changes
  const handleCertificateDateChange = (e, certificateType, field) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      maintenance: {
        ...prev.maintenance,
        [certificateType]: {
          ...prev.maintenance[certificateType],
          [field]: value,
        },
      },
    }));
  };

  // Handle driver image upload
  const handleDriverImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload only image files");
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("Image size should not exceed 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          driver: {
            ...prev.driver,
            driverImage: event.target.result,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!branchId) {
      alert("Branch ID not found. Please login again.");
      return;
    }

    try {
      const url = showEditModal
        ? `http://localhost:5000/api/buses/${selectedBus._id}`
        : "http://localhost:5000/api/buses";
      const method = showEditModal ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          branch_id: branchId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(showEditModal ? "Bus updated successfully!" : "Bus added successfully!");
        resetForm();
        setShowAddModal(false);
        setShowEditModal(false);
        fetchBuses();
        fetchStats();
      } else {
        alert(data.message || "Failed to save bus");
      }
    } catch (error) {
      console.error("Error saving bus:", error);
      alert("Failed to save bus. Please check your connection.");
    }
  };

  const handleEdit = (bus) => {
    setSelectedBus(bus);
    setFormData({
      busId: bus.busId || "",
      registrationNumber: bus.registrationNumber || "",
      busType: bus.busType || "Standard bus",
      model: bus.model || "",
      capacity: bus.capacity || "",
      buildYear: bus.buildYear || "",
      busStatus: bus.busStatus || "Active",
      availability: bus.availability || "Available",
      driver: bus.driver || {
        driverName: "",
        driverContact: "",
        driverImage: "",
        licenseNumber: "",
      },
      staff: bus.staff || {
        staffName: "",
        staffContact: "",
      },
      customFields: bus.customFields || [],
      route: bus.route || {
        routeName: "",
        stops: [],
        totalDistance: "",
        distanceUnit: "km",
        parkingPlace: {
          name: "",
          address: "",
        },
      },
      safety: bus.safety || {
        firstAidKit: false,
        fireExtinguisher: false,
        emergencyContactNumber: "",
        gpsInstalled: false,
        cctv: false,
        seatBelts: false,
        speedGovernor: false,
      },
      maintenance: bus.maintenance || {
        lastServiceDate: "",
        nextServiceDate: "",
        pollutionCertificate: {
          fileName: "",
          fileData: "",
          expiryDate: "",
          lastUpdatedDate: "",
        },
        fitnessCertificate: {
          fileName: "",
          fileData: "",
          expiryDate: "",
          lastUpdatedDate: "",
        },
        permit: {
          fileName: "",
          fileData: "",
        },
        maintenanceNotes: "",
      },
      remarks: bus.remarks || "",
    });
    setShowEditModal(true);
  };

  const handleDelete = async (busId) => {
    if (window.confirm("Are you sure you want to deactivate this bus?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/buses/${busId}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (data.success) {
          alert("Bus deactivated successfully!");
          fetchBuses();
          fetchStats();
        } else {
          alert(data.message || "Failed to deactivate bus");
        }
      } catch (error) {
        console.error("Error deactivating bus:", error);
        alert("Failed to deactivate bus");
      }
    }
  };

  const handleViewDetails = (bus) => {
    setSelectedBus(bus);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      busId: "",
      registrationNumber: "",
      busType: "Standard bus",
      model: "",
      capacity: "",
      buildYear: "",
      busStatus: "Active",
      availability: "Available",
      driver: {
        driverName: "",
        driverContact: "",
        driverImage: "",
        licenseNumber: "",
      },
      staff: {
        staffName: "",
        staffContact: "",
      },
      customFields: [],
      route: {
        routeName: "",
        stops: [],
        totalDistance: "",
        distanceUnit: "km",
        parkingPlace: {
          name: "",
          address: "",
        },
      },
      safety: {
        firstAidKit: false,
        fireExtinguisher: false,
        emergencyContactNumber: "",
        gpsInstalled: false,
        cctv: false,
        seatBelts: false,
        speedGovernor: false,
      },
      maintenance: {
        lastServiceDate: "",
        nextServiceDate: "",
        pollutionCertificate: {
          fileName: "",
          fileData: "",
          expiryDate: "",
          lastUpdatedDate: "",
        },
        fitnessCertificate: {
          fileName: "",
          fileData: "",
          expiryDate: "",
          lastUpdatedDate: "",
        },
        permit: {
          fileName: "",
          fileData: "",
        },
        maintenanceNotes: "",
      },
      remarks: "",
    });
    setSelectedBus(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Active":
        return "status-badge status-active";
      case "Under Maintenance":
        return "status-badge status-maintenance";
      case "Out of Service":
        return "status-badge status-inactive";
      case "Good":
        return "status-badge status-good";
      case "Needs Service":
        return "status-badge status-warning";
      case "Critical":
        return "status-badge status-critical";
      case "Assigned":
        return "status-badge status-assigned";
      case "Not Assigned":
        return "status-badge status-not-assigned";
      default:
        return "status-badge";
    }
  };

  if (loading) {
    return (
      <div className="dash-panel">
        <div className="loading">Loading buses...</div>
      </div>
    );
  }

  if (!branchId) {
    return (
      <div className="dash-panel">
        <div className="error-message" style={{padding: "40px", textAlign: "center"}}>
          <h3 style={{color: "#e74c3c"}}>Branch ID Not Found</h3>
          <p>Please log in again to access bus management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="buses-container">
      <div className="buses-header">
        <div>
          <h2>Bus Management</h2>
          <p>Manage your fleet of buses, routes, drivers, and maintenance</p>
        </div>
        <button className="btn-add" onClick={() => setShowAddModal(true)}>
          Add New Bus
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-1"></div>
            <div className="stat-info">
              <h3>{stats.total[0]?.count || 0}</h3>
              <p>Total Buses</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-2"></div>
            <div className="stat-info">
              <h3>
                {stats.byStatus.find(s => s._id === "Active")?.count || 0}
              </h3>
              <p>Active Buses</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-3"></div>
            <div className="stat-info">
              <h3>{stats.needsMaintenance[0]?.count || 0}</h3>
              <p>Needs Maintenance</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-4"></div>
            <div className="stat-info">
              <h3>{stats.withDriver[0]?.count || 0}</h3>
              <p>With Assigned Driver</p>
            </div>
          </div>
        </div>
      )}

      {/* Buses Grid */}
      <div className="buses-grid-container">
        {buses.length === 0 ? (
          <div className="no-buses-message">
            <h3>No Buses Found</h3>
            <p>Add your first bus to get started.</p>
          </div>
        ) : (
          <div className="buses-grid">
            {buses.map((bus) => (
              <div 
                key={bus._id} 
                className="bus-card"
                onClick={() => handleViewDetails(bus)}
              >
                <div className="bus-card-header">
                  <div className="bus-card-title">
                    <h3>{bus.busId}</h3>
                    <p className="registration-num">{bus.registrationNumber}</p>
                  </div>
                  <span className={`bus-status-badge ${bus.busStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                    {bus.busStatus}
                  </span>
                </div>

                <div className="bus-card-body">
                  <div className="bus-info-row">
                    <span className="info-label">Type:</span>
                    <span className="info-value">{bus.busType}</span>
                  </div>
                  <div className="bus-info-row">
                    <span className="info-label">Capacity:</span>
                    <span className="info-value">{bus.capacity} seats</span>
                  </div>
                  <div className="bus-info-row">
                    <span className="info-label">Route:</span>
                    <span className="info-value">{bus.route?.routeName || "Not Assigned"}</span>
                  </div>
                  <div className="bus-info-row">
                    <span className="info-label">Driver:</span>
                    <span className="info-value">{bus.driver?.driverName || "Not Assigned"}</span>
                  </div>
                  <div className="bus-info-row">
                    <span className="info-label">Availability:</span>
                    <span className={`availability-badge ${bus.availability.toLowerCase().replace(/\s+/g, '-')}`}>
                      {bus.availability}
                    </span>
                  </div>
                </div>

                <div className="bus-card-footer">
                  <button
                    className="btn-card-action btn-details"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(bus);
                    }}
                  >
                    View Details
                  </button>
                  <button
                    className="btn-card-action btn-edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(bus);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-card-action btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(bus._id);
                    }}
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay" onClick={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          resetForm();
        }}>
          <div className="modal-content bus-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{showEditModal ? "Edit Bus" : "Add New Bus"}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="bus-form">
              {/* Basic Information Section */}
              <div className="form-section">
                <h3 className="section-title">1. Basic Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Bus ID *</label>
                    <input
                      type="text"
                      name="busId"
                      value={formData.busId}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., B001"
                    />
                  </div>
                  <div className="form-group">
                    <label>Registration Number *</label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., KA-01-AB-1234"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bus Type *</label>
                    <select
                      name="busType"
                      value={formData.busType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Mini bus">Mini bus</option>
                      <option value="Standard bus">Standard bus</option>
                      <option value="Vans">Vans</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Model</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      placeholder="e.g., Ashok Leyland Viking"
                    />
                  </div>
                  <div className="form-group">
                    <label>Capacity (Seats) *</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      placeholder="e.g., 40"
                    />
                  </div>
                  <div className="form-group">
                    <label>Build Year</label>
                    <input
                      type="number"
                      name="buildYear"
                      value={formData.buildYear}
                      onChange={handleInputChange}
                      min="1900"
                      max="2100"
                      placeholder="e.g., 2020"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bus Status *</label>
                    <select
                      name="busStatus"
                      value={formData.busStatus}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Availability *</label>
                    <select
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Available">Available</option>
                      <option value="Currently Assigned">Currently Assigned</option>
                    </select>
                  </div>

                  {/* Driver Information */}
                  <div className="form-group full-width">
                    <h4 style={{margin: "20px 0 10px 0", color: "#2c3e50"}}>Driver Information</h4>
                  </div>
                  <div className="form-group">
                    <label>Driver Name</label>
                    <input
                      type="text"
                      name="driverName"
                      value={formData.driver.driverName}
                      onChange={(e) => handleInputChange(e, "driver")}
                      placeholder="e.g., Ravi Kumar"
                    />
                  </div>
                  <div className="form-group">
                    <label>Driver Contact</label>
                    <input
                      type="tel"
                      name="driverContact"
                      value={formData.driver.driverContact}
                      onChange={(e) => handleInputChange(e, "driver")}
                      placeholder="e.g., 9876543210"
                    />
                  </div>
                  <div className="form-group">
                    <label>License Number</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.driver.licenseNumber}
                      onChange={(e) => handleInputChange(e, "driver")}
                      placeholder="e.g., KA1234567890"
                    />
                  </div>
                  <div className="form-group">
                    <label>Driver Image (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDriverImageUpload}
                    />
                    {formData.driver.driverImage && (
                      <img
                        src={formData.driver.driverImage}
                        alt="Driver"
                        style={{
                          marginTop: "10px",
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    )}
                  </div>

                  {/* Staff Information */}
                  <div className="form-group full-width">
                    <h4 style={{margin: "20px 0 10px 0", color: "#2c3e50"}}>Staff/Attendant Information</h4>
                  </div>
                  <div className="form-group">
                    <label>Staff Name</label>
                    <input
                      type="text"
                      name="staffName"
                      value={formData.staff.staffName}
                      onChange={(e) => handleInputChange(e, "staff")}
                      placeholder="e.g., Sita Devi"
                    />
                  </div>
                  <div className="form-group">
                    <label>Staff Contact</label>
                    <input
                      type="tel"
                      name="staffContact"
                      value={formData.staff.staffContact}
                      onChange={(e) => handleInputChange(e, "staff")}
                      placeholder="e.g., 9876543211"
                    />
                  </div>

                  {/* Custom Fields */}
                  <div className="form-group full-width">
                    <h4 style={{margin: "20px 0 10px 0", color: "#2c3e50"}}>Custom Fields</h4>
                    <button
                      type="button"
                      className="btn-add-field"
                      onClick={addCustomField}
                    >
                      + Add Custom Field
                    </button>
                  </div>
                  {formData.customFields.map((field, index) => (
                    <React.Fragment key={index}>
                      <div className="form-group">
                        <label>Field Name</label>
                        <input
                          type="text"
                          value={field.fieldName}
                          onChange={(e) => updateCustomField(index, "fieldName", e.target.value)}
                          placeholder="e.g., Insurance Company"
                        />
                      </div>
                      <div className="form-group" style={{position: "relative"}}>
                        <label>Field Value</label>
                        <input
                          type="text"
                          value={field.fieldValue}
                          onChange={(e) => updateCustomField(index, "fieldValue", e.target.value)}
                          placeholder="e.g., HDFC ERGO"
                        />
                        <button
                          type="button"
                          className="btn-remove-field"
                          onClick={() => removeCustomField(index)}
                          title="Remove field"
                        >
                          ×
                        </button>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Route Information Section */}
              <div className="form-section">
                <h3 className="section-title">2. Route Information</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Route Name</label>
                    <input
                      type="text"
                      name="routeName"
                      value={formData.route.routeName}
                      onChange={(e) => handleInputChange(e, "route")}
                      placeholder="e.g., North Campus Route"
                    />
                  </div>

                  {/* Stops Section */}
                  <div className="form-group full-width">
                    <h4 style={{margin: "20px 0 10px 0", color: "#2c3e50"}}>Route Stops</h4>
                    <button
                      type="button"
                      className="btn-add-field"
                      onClick={addStop}
                    >
                      + Add Stop
                    </button>
                  </div>
                  {formData.route.stops.map((stop, index) => (
                    <React.Fragment key={index}>
                      <div className="form-group">
                        <label>Stop Name</label>
                        <input
                          type="text"
                          value={stop.stopName}
                          onChange={(e) => updateStop(index, "stopName", e.target.value)}
                          placeholder="e.g., Main Gate"
                        />
                      </div>
                      <div className="form-group" style={{position: "relative"}}>
                        <label>Timing</label>
                        <input
                          type="time"
                          value={stop.timing}
                          onChange={(e) => updateStop(index, "timing", e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn-remove-field"
                          onClick={() => removeStop(index)}
                          title="Remove stop"
                        >
                          ×
                        </button>
                      </div>
                    </React.Fragment>
                  ))}

                  {/* Distance */}
                  <div className="form-group">
                    <label>Total Distance</label>
                    <input
                      type="number"
                      name="totalDistance"
                      value={formData.route.totalDistance}
                      onChange={(e) => handleInputChange(e, "route")}
                      min="0"
                      step="0.1"
                      placeholder="e.g., 15.5"
                    />
                  </div>
                  <div className="form-group">
                    <label>Distance Unit</label>
                    <select
                      name="distanceUnit"
                      value={formData.route.distanceUnit}
                      onChange={(e) => handleInputChange(e, "route")}
                    >
                      <option value="km">Kilometers (km)</option>
                      <option value="meters">Meters (m)</option>
                    </select>
                  </div>

                  {/* Parking Place */}
                  <div className="form-group full-width">
                    <h4 style={{margin: "20px 0 10px 0", color: "#2c3e50"}}>Bus Parking Information</h4>
                  </div>
                  <div className="form-group">
                    <label>Parking Place Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.route.parkingPlace.name}
                      onChange={(e) => handleNestedChange(e, "route", "parkingPlace")}
                      placeholder="e.g., Main Parking Lot"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Parking Address</label>
                    <textarea
                      name="address"
                      value={formData.route.parkingPlace.address}
                      onChange={(e) => handleNestedChange(e, "route", "parkingPlace")}
                      rows="2"
                      placeholder="e.g., Behind School Building, Near Gate 2"
                    />
                  </div>
                </div>
              </div>

              {/* Safety Information Section */}
              <div className="form-section">
                <h3 className="section-title">3. Safety Information</h3>
                <div className="form-grid">
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="firstAidKit"
                        checked={formData.safety.firstAidKit}
                        onChange={(e) => handleInputChange(e, "safety")}
                      />
                      <span>First Aid Kit Available</span>
                    </label>
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="fireExtinguisher"
                        checked={formData.safety.fireExtinguisher}
                        onChange={(e) => handleInputChange(e, "safety")}
                      />
                      <span>Fire Extinguisher Available</span>
                    </label>
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="gpsInstalled"
                        checked={formData.safety.gpsInstalled}
                        onChange={(e) => handleInputChange(e, "safety")}
                      />
                      <span>GPS Installed</span>
                    </label>
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="cctv"
                        checked={formData.safety.cctv}
                        onChange={(e) => handleInputChange(e, "safety")}
                      />
                      <span>CCTV Installed</span>
                    </label>
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="seatBelts"
                        checked={formData.safety.seatBelts}
                        onChange={(e) => handleInputChange(e, "safety")}
                      />
                      <span>Seat Belts Available</span>
                    </label>
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="speedGovernor"
                        checked={formData.safety.speedGovernor}
                        onChange={(e) => handleInputChange(e, "safety")}
                      />
                      <span>Speed Governor Installed</span>
                    </label>
                  </div>
                  <div className="form-group">
                    <label>Emergency Contact Number</label>
                    <input
                      type="tel"
                      name="emergencyContactNumber"
                      value={formData.safety.emergencyContactNumber}
                      onChange={(e) => handleInputChange(e, "safety")}
                      placeholder="e.g., 9876543210"
                    />
                  </div>
                </div>
              </div>

              {/* Maintenance Information Section */}
              <div className="form-section">
                <h3 className="section-title">4. Maintenance Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Last Service Date</label>
                    <input
                      type="date"
                      name="lastServiceDate"
                      value={formData.maintenance.lastServiceDate}
                      onChange={(e) => handleInputChange(e, "maintenance")}
                    />
                  </div>
                  <div className="form-group">
                    <label>Next Service Date</label>
                    <input
                      type="date"
                      name="nextServiceDate"
                      value={formData.maintenance.nextServiceDate}
                      onChange={(e) => handleInputChange(e, "maintenance")}
                    />
                  </div>

                  {/* PDF Upload Sections */}
                  <div className="form-group full-width">
                    <h4 style={{margin: "20px 0 10px 0", color: "#2c3e50"}}>Certificates & Documents</h4>
                  </div>

                  {/* Pollution Certificate */}
                  <div className="form-group full-width">
                    <h5 style={{margin: "15px 0 8px 0", color: "#34495e", fontSize: "14px", fontWeight: "600"}}>Pollution Certificate</h5>
                  </div>
                  <div className="form-group">
                    <label>Upload Certificate (PDF)</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleFileUpload(e, "pollutionCertificate")}
                    />
                    {formData.maintenance.pollutionCertificate.fileName && (
                      <div className="file-info">
                        {formData.maintenance.pollutionCertificate.fileName}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      value={formData.maintenance.pollutionCertificate.expiryDate}
                      onChange={(e) => handleCertificateDateChange(e, "pollutionCertificate", "expiryDate")}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Updated Date</label>
                    <input
                      type="date"
                      value={formData.maintenance.pollutionCertificate.lastUpdatedDate}
                      onChange={(e) => handleCertificateDateChange(e, "pollutionCertificate", "lastUpdatedDate")}
                    />
                  </div>

                  {/* Fitness Certificate */}
                  <div className="form-group full-width">
                    <h5 style={{margin: "15px 0 8px 0", color: "#34495e", fontSize: "14px", fontWeight: "600"}}>Fitness Certificate</h5>
                  </div>
                  <div className="form-group">
                    <label>Upload Certificate (PDF)</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleFileUpload(e, "fitnessCertificate")}
                    />
                    {formData.maintenance.fitnessCertificate.fileName && (
                      <div className="file-info">
                        {formData.maintenance.fitnessCertificate.fileName}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      value={formData.maintenance.fitnessCertificate.expiryDate}
                      onChange={(e) => handleCertificateDateChange(e, "fitnessCertificate", "expiryDate")}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Updated Date</label>
                    <input
                      type="date"
                      value={formData.maintenance.fitnessCertificate.lastUpdatedDate}
                      onChange={(e) => handleCertificateDateChange(e, "fitnessCertificate", "lastUpdatedDate")}
                    />
                  </div>

                  {/* Permit */}
                  <div className="form-group full-width">
                    <h5 style={{margin: "15px 0 8px 0", color: "#34495e", fontSize: "14px", fontWeight: "600"}}>Permit</h5>
                  </div>
                  <div className="form-group">
                    <label>Upload Permit (PDF)</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleFileUpload(e, "permit")}
                    />
                    {formData.maintenance.permit.fileName && (
                      <div className="file-info">
                        {formData.maintenance.permit.fileName}
                      </div>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label>Maintenance Notes</label>
                    <textarea
                      name="maintenanceNotes"
                      value={formData.maintenance.maintenanceNotes}
                      onChange={(e) => handleInputChange(e, "maintenance")}
                      rows="3"
                      placeholder="Any maintenance notes or issues"
                    />
                  </div>
                </div>
              </div>

              {/* Remarks Section */}
              <div className="form-section">
                <h3 className="section-title">Additional Information</h3>
                <div className="form-group full-width">
                  <label>Remarks</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Any additional notes or remarks"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {showEditModal ? "Update Bus" : "Add Bus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedBus && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content bus-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Bus Details - {selectedBus.busId}</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                ×
              </button>
            </div>
            <div className="details-content">
              {/* Basic Information */}
              <div className="details-section">
                <h3>Basic Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Bus ID:</span>
                    <span className="detail-value">{selectedBus.busId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Bus Number:</span>
                    <span className="detail-value">{selectedBus.busNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Registration Number:</span>
                    <span className="detail-value">{selectedBus.registrationNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Bus Type:</span>
                    <span className="detail-value">{selectedBus.busType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Capacity:</span>
                    <span className="detail-value">{selectedBus.capacity} seats</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Model:</span>
                    <span className="detail-value">{selectedBus.model || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Year:</span>
                    <span className="detail-value">{selectedBus.year || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Color:</span>
                    <span className="detail-value">{selectedBus.color || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div className="details-section">
                <h3>Route Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Route Name:</span>
                    <span className="detail-value">{selectedBus.route?.routeName || "Not Assigned"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Route ID:</span>
                    <span className="detail-value">{selectedBus.route?.routeId || "N/A"}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Description:</span>
                    <span className="detail-value">{selectedBus.route?.routeDescription || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Starting Point:</span>
                    <span className="detail-value">{selectedBus.route?.startingPoint || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ending Point:</span>
                    <span className="detail-value">{selectedBus.route?.endingPoint || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Morning Timing:</span>
                    <span className="detail-value">{selectedBus.route?.morningTiming || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Evening Timing:</span>
                    <span className="detail-value">{selectedBus.route?.eveningTiming || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Distance:</span>
                    <span className="detail-value">{selectedBus.route?.totalDistance ? `${selectedBus.route.totalDistance} km` : "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Driver Information */}
              <div className="details-section">
                <h3>Driver & Staff Information</h3>
                <div className="driver-info-header">
                  <div className="driver-info-left">
                    <div className="detail-item">
                      <span className="detail-label">Driver Name:</span>
                      <span className="detail-value">{selectedBus.driver?.driverName || "Not Assigned"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Driver ID:</span>
                      <span className="detail-value">{selectedBus.driver?.driverId || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Contact Number:</span>
                      <span className="detail-value">{selectedBus.driver?.contactNumber || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">License Number:</span>
                      <span className="detail-value">{selectedBus.driver?.licenseNumber || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Assignment Status:</span>
                      <span className={getStatusBadgeClass(selectedBus.driver?.assignmentStatus)}>
                        {selectedBus.driver?.assignmentStatus || "Not Assigned"}
                      </span>
                    </div>
                  </div>
                  {selectedBus.driver?.driverImage && (
                    <div className="driver-image-section">
                      <img 
                        src={selectedBus.driver.driverImage} 
                        alt="Driver" 
                        className="driver-photo"
                      />
                    </div>
                  )}
                </div>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Attendant Name:</span>
                    <span className="detail-value">{selectedBus.attendant?.attendantName || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Attendant Contact:</span>
                    <span className="detail-value">{selectedBus.attendant?.attendantContact || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="details-section">
                <h3>Bus Status</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Operational Status:</span>
                    <span className={getStatusBadgeClass(selectedBus.operationalStatus)}>
                      {selectedBus.operationalStatus}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Availability:</span>
                    <span className="detail-value">{selectedBus.availability}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Bus Condition:</span>
                    <span className={getStatusBadgeClass(selectedBus.busCondition)}>
                      {selectedBus.busCondition}
                    </span>
                  </div>
                </div>
              </div>

              {/* Maintenance Information */}
              <div className="details-section">
                <h3>Maintenance Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Last Service Date:</span>
                    <span className="detail-value">
                      {selectedBus.maintenance?.lastServiceDate
                        ? new Date(selectedBus.maintenance.lastServiceDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Next Service Due:</span>
                    <span className="detail-value">
                      {selectedBus.maintenance?.nextServiceDueDate
                        ? new Date(selectedBus.maintenance.nextServiceDueDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Insurance Expiry:</span>
                    <span className="detail-value">
                      {selectedBus.maintenance?.insuranceExpiryDate
                        ? new Date(selectedBus.maintenance.insuranceExpiryDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Pollution Certificate:</span>
                    <span className="detail-value">
                      {selectedBus.maintenance?.pollutionCertificateStatus || "Pending"}
                      {selectedBus.maintenance?.pollutionCertificateExpiry &&
                        ` (Expires: ${new Date(selectedBus.maintenance.pollutionCertificateExpiry).toLocaleDateString()})`}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fitness Certificate:</span>
                    <span className="detail-value">
                      {selectedBus.maintenance?.fitnessCertificateStatus || "Pending"}
                      {selectedBus.maintenance?.fitnessCertificateExpiry &&
                        ` (Expires: ${new Date(selectedBus.maintenance.fitnessCertificateExpiry).toLocaleDateString()})`}
                    </span>
                  </div>
                  {selectedBus.maintenance?.maintenanceNotes && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Maintenance Notes:</span>
                      <span className="detail-value">{selectedBus.maintenance.maintenanceNotes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Safety Information */}
              <div className="details-section">
                <h3>Safety Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">First Aid Kit:</span>
                    <span className="detail-value">{selectedBus.safety?.firstAidKit ? "✅ Yes" : "❌ No"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fire Extinguisher:</span>
                    <span className="detail-value">{selectedBus.safety?.fireExtinguisher ? "✅ Yes" : "❌ No"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">GPS Installed:</span>
                    <span className="detail-value">{selectedBus.safety?.gpsInstalled ? "✅ Yes" : "❌ No"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">CCTV:</span>
                    <span className="detail-value">{selectedBus.safety?.cctv ? "✅ Yes" : "❌ No"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Emergency Contact:</span>
                    <span className="detail-value">{selectedBus.safety?.emergencyContactNumber || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Compliance Status:</span>
                    <span className="detail-value">{selectedBus.safety?.complianceStatus || "Pending"}</span>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {selectedBus.remarks && (
                <div className="details-section">
                  <h3>📝 Additional Information</h3>
                  <div className="details-grid">
                    <div className="detail-item full-width">
                      <span className="detail-label">Remarks:</span>
                      <span className="detail-value">{selectedBus.remarks}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}