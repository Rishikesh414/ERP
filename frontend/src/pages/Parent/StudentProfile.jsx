import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/Parent.css";

const API_BASE = "http://localhost:5000/api/parent";

export default function StudentProfile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "parent") {
      navigate("/login");
      return;
    }
    loadStudentProfile();
  }, []);

  const loadStudentProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/${user.id}/student`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudent(res.data);
    } catch (err) {
      console.error("Failed to load student profile", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="parent-page">
        <div className="parent-loading">
          <div className="loading-spinner"></div>
          <p>Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="parent-page">
        <div className="parent-container">
          <div className="parent-guard">
            <h3>Student Profile Not Found</h3>
            <p>Could not load student information.</p>
            <button className="btn-primary" onClick={() => navigate("/parent/dashboard")}>
              Back to Dashboard
            </button>
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
            <h1>{student.name}'s Profile</h1>
            <p>Complete student information and contact details</p>
          </div>
          <div className="parent-header-actions">
            <button className="btn-ghost" onClick={() => navigate("/parent/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Academic Information */}
        <div className="student-info-card">
          <h3>Academic Information</h3>
          <div className="student-info-grid">
            <div className="info-item">
              <label>Student Name</label>
              <p>{student.name}</p>
            </div>
            <div className="info-item">
              <label>Class</label>
              <p>{student.class}</p>
            </div>
            <div className="info-item">
              <label>Section</label>
              <p>{student.section}</p>
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
              <label>Student Status</label>
              <p>
                <span className={`badge ${student.status === "active" ? "success" : "muted"}`}>
                  {student.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="student-info-card">
          <h3>Personal Information</h3>
          <div className="student-info-grid">
            <div className="info-item">
              <label>Parent/Guardian Name</label>
              <p>{student.parentName}</p>
            </div>
            <div className="info-item">
              <label>Contact Number</label>
              <p>{student.phoneNo}</p>
            </div>
            <div className="info-item">
              <label>Address</label>
              <p>{student.address}</p>
            </div>
            {student.aadharCardNumber && (
              <div className="info-item">
                <label>Aadhar Card Number</label>
                <p>{student.aadharCardNumber}</p>
              </div>
            )}
            {student.rationCardNumber && (
              <div className="info-item">
                <label>Ration Card Number</label>
                <p>{student.rationCardNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Special Notes */}
        {student.customNote && (
          <div className="student-info-card">
            <h3>Special Notes</h3>
            <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: "6px", borderLeft: "4px solid #667eea" }}>
              <p style={{ margin: 0, color: "#333", lineHeight: "1.6" }}>{student.customNote}</p>
            </div>
          </div>
        )}

        {/* Custom Fields */}
        {student.customFields && student.customFields.length > 0 && (
          <div className="student-info-card">
            <h3>Additional Information</h3>
            <div className="student-info-grid">
              {student.customFields.map((field, idx) => (
                <div key={idx} className="info-item">
                  <label>{field.key}</label>
                  <p>{field.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Photo */}
        {student.image && (
          <div className="student-info-card">
            <h3>Student Photo</h3>
            <div style={{ 
              textAlign: "center",
              padding: "2rem",
              background: "#f5f5f5",
              borderRadius: "8px"
            }}>
              <img 
                src={student.image} 
                alt={student.name}
                style={{
                  maxWidth: "300px",
                  height: "auto",
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
                }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <button 
            className="btn-primary"
            onClick={() => navigate("/parent/reports?tab=marks")}
            style={{ cursor: "pointer" }}
          >
            View Marks & Reports
          </button>
          <button 
            className="btn-primary"
            onClick={() => navigate("/parent/reports?tab=fees")}
            style={{ cursor: "pointer" }}
          >
            View Fee Details
          </button>
        </div>
      </div>
    </div>
  );
}
