import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/Parent.css";

const API_BASE = "http://localhost:5000/api/parent";

export default function ParentDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user?.role !== "parent") {
      navigate("/login");
      return;
    }
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/${user.id}/student`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudent(res.data);
    } catch (err) {
      console.error("Failed to load student data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="parent-page">
        <div className="parent-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="parent-page">
        <div className="parent-container">
          <div className="parent-guard">
            <h3>Student Information Not Found</h3>
            <p>We couldn't find student information linked to your account.</p>
            <button className="btn-primary" onClick={handleLogout}>Go to Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="parent-page">
      <div className="parent-container">
        {/* Header */}
        <div className="parent-header">
          <div className="parent-header-info">
            <h1>Welcome, {user.name}!</h1>
            <p>View your child's progress, marks, and fee status</p>
          </div>
          <div className="parent-header-actions">
            <button className="btn-ghost" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* Student Info Card */}
        <div className="student-info-card">
          <div className="student-info-grid">
            <div className="info-item">
              <label>Student Name</label>
              <p>{student.name}</p>
            </div>
            <div className="info-item">
              <label>Class & Section</label>
              <p>{student.class} - {student.section}</p>
            </div>
            <div className="info-item">
              <label>Roll Number</label>
              <p>{student.rollNo}</p>
            </div>
            <div className="info-item">
              <label>Admission Number</label>
              <p>{student.admissionNumber}</p>
            </div>
            <div className="info-item">
              <label>Academic Year</label>
              <p>{student.academicYear}</p>
            </div>
            <div className="info-item">
              <label>Status</label>
              <p>
                <span className={`badge ${student.status === "active" ? "success" : "muted"}`}>
                  {student.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="parent-tabs">
          <button
            className={`parent-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Overview
          </button>
          <button
            className={`parent-tab ${activeTab === "marks" ? "active" : ""}`}
            onClick={() => setActiveTab("marks")}
          >
            📝 Marks & Results
          </button>
          <button
            className={`parent-tab ${activeTab === "fees" ? "active" : ""}`}
            onClick={() => setActiveTab("fees")}
          >
            💳 Fee Status
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="student-overview">
            <div className="student-info-card">
              <h3>Personal Information</h3>
              <div className="student-info-grid">
                <div className="info-item">
                  <label>Date of Birth</label>
                  <p>{student.dateOfBirth || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Address</label>
                  <p>{student.address}</p>
                </div>
                <div className="info-item">
                  <label>Phone Number</label>
                  <p>{student.phoneNo}</p>
                </div>
                <div className="info-item">
                  <label>Aadhar Card</label>
                  <p>{student.aadharCardNumber || "Not provided"}</p>
                </div>
              </div>
              
              {student.customNote && (
                <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#f5f5f5", borderRadius: "6px" }}>
                  <strong>Special Notes:</strong>
                  <p style={{ margin: "0.5rem 0 0 0" }}>{student.customNote}</p>
                </div>
              )}
            </div>

            <div style={{ marginTop: "2rem" }}>
              <Link to="/parent/reports" className="btn-primary" style={{ display: "inline-block" }}>
                View Detailed Reports
              </Link>
            </div>
          </div>
        )}

        {/* Marks Tab */}
        {activeTab === "marks" && (
          <div className="marks-section">
            <h3>Academic Performance</h3>
            <div style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
              <p>Detailed marks and exam results are available in the Reports section.</p>
              <Link to="/parent/reports?tab=marks" className="btn-primary" style={{ display: "inline-block", marginTop: "1rem" }}>
                View Full Reports
              </Link>
            </div>
          </div>
        )}

        {/* Fees Tab */}
        {activeTab === "fees" && (
          <div className="fees-section">
            <h3>Fee Information</h3>
            <div style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
              <p>Complete fee status and payment history available in the Reports section.</p>
              <Link to="/parent/reports?tab=fees" className="btn-primary" style={{ display: "inline-block", marginTop: "1rem" }}>
                View Fee Details
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}