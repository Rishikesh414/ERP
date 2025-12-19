import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/ParentLogin.css";
import ematixLogo from "../../assets/ematix.png";

const API_BASE = "http://localhost:5000/api";

export default function ParentLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Student selection, 2: Password entry
  const [studentName, setStudentName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifiedParent, setVerifiedParent] = useState(null);

  const handleStudentVerify = async (e) => {
    e.preventDefault();
    if (!studentName.trim() || !phone.trim()) {
      setError("Please enter both student name and phone number");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API_BASE}/parent/verify`, {
        params: { studentName, phone }
      });

      setVerifiedParent(res.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Student verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleParentLogin = async (e) => {
    e.preventDefault();
    if (!verifiedParent) return;

    try {
      setLoading(true);
      setError("");

      // Store token and parent info from verification response
      if (verifiedParent.token) {
        localStorage.setItem("token", verifiedParent.token);
      }
      
      localStorage.setItem("user", JSON.stringify({
        id: verifiedParent.parentId,
        name: verifiedParent.parentName,
        email: verifiedParent.parentName,
        role: "parent"
      }));

      navigate("/parent/dashboard");
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parent-login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img src={ematixLogo} alt="Ematix Logo" className="ematix-logo" />
            <div className="login-logo">
              <span>👨‍👩‍👧‍👦</span>
            </div>
            <h1>Parent Portal</h1>
            <p>Track your child's academic progress</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {step === 1 ? (
            /* Step 1: Student Verification */
            <form onSubmit={handleStudentVerify}>
              <div className="form-group">
                <label htmlFor="studentName">Student Name *</label>
                <input
                  id="studentName"
                  type="text"
                  placeholder="Enter your child's full name"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    setError("");
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Contact Phone Number *</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="10-digit phone number"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError("");
                  }}
                  maxLength="10"
                  pattern="[0-9]{10}"
                  required
                />
                <small>This will be your login password</small>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

              <div className="login-footer">
                <p>Not a parent? <a href="/login">Login as staff</a></p>
              </div>
            </form>
          ) : (
            /* Step 2: Password Confirmation */
            <div>
              <div className="verification-success">
                <div className="success-icon">✓</div>
                <p>Student verified successfully!</p>
                <p className="student-name">{verifiedParent?.studentName}</p>
                <p className="parent-name">Parent: {verifiedParent?.parentName}</p>
              </div>

              <button
                onClick={handleParentLogin}
                className="btn-primary"
                disabled={loading}
                style={{ width: "100%", marginTop: "2rem" }}
              >
                {loading ? "Logging in..." : "Login to Portal"}
              </button>

              <button
                onClick={() => {
                  setStep(1);
                  setVerifiedParent(null);
                  setStudentName("");
                  setPhone("");
                  setError("");
                }}
                className="btn-ghost"
                style={{ width: "100%", marginTop: "1rem" }}
              >
                Back
              </button>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="features-section">
          <div className="feature">
            <span className="feature-icon">📊</span>
            <h3>Track Grades</h3>
            <p>Monitor your child's exam scores and academic performance</p>
          </div>
          <div className="feature">
            <span className="feature-icon">💳</span>
            <h3>Fee Status</h3>
            <p>View fee structure, payment history, and pending amounts</p>
          </div>
          <div className="feature">
            <span className="feature-icon">📝</span>
            <h3>Reports</h3>
            <p>Access attendance records and academic reports anytime</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🔒</span>
            <h3>Secure Access</h3>
            <p>Phone-based secure login for your peace of mind</p>
          </div>
        </div>
      </div>
    </div>
  );
}
