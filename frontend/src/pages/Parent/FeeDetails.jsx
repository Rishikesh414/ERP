import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/Parent.css";

const API_BASE = "http://localhost:5000/api/parent";

export default function FeeDetails() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "parent") {
      navigate("/login");
      return;
    }
    loadFeeDetails();
  }, []);

  const loadFeeDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/${user.id}/fees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFees(res.data);
    } catch (err) {
      console.error("Failed to load fee details", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="parent-page">
        <div className="parent-loading">
          <div className="loading-spinner"></div>
          <p>Loading fee details...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!fees) {
    return (
      <div className="parent-page">
        <div className="parent-container">
          <div className="parent-guard">
            <h3>Fee Details Not Available</h3>
            <p>Could not load fee information for your student.</p>
            <button className="btn-primary" onClick={() => navigate("/parent/dashboard")}>
              Go to Dashboard
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
            <h1>Fee Details & Payment Status</h1>
            <p>Payment information for {fees.student.name}</p>
          </div>
          <div className="parent-header-actions">
            <button className="btn-ghost" onClick={() => navigate("/parent/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Student Info */}
        <div className="student-info-card">
          <div className="student-info-grid">
            <div className="info-item">
              <label>Student Name</label>
              <p>{fees.student.name}</p>
            </div>
            <div className="info-item">
              <label>Class & Section</label>
              <p>{fees.student.class} - {fees.student.section}</p>
            </div>
            <div className="info-item">
              <label>Roll Number</label>
              <p>{fees.student.rollNo}</p>
            </div>
          </div>
        </div>

        {/* Fee Summary */}
        <div className="fees-summary">
          <div className="fee-card">
            <h4>Total Fee Payable</h4>
            <p className="fee-value">
              {formatCurrency(fees.feeStructureTotal)}
            </p>
          </div>
          <div className="fee-card success">
            <h4>Amount Paid</h4>
            <p className="fee-value">
              {formatCurrency(fees.paidTotal)}
            </p>
          </div>
          <div className={`fee-card ${fees.pendingAmount > 0 ? "pending" : "success"}`}>
            <h4>Amount Due</h4>
            <p className="fee-value">
              {formatCurrency(fees.pendingAmount)}
            </p>
            {fees.pendingAmount > 0 && (
              <small>Action Required</small>
            )}
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="fees-section">
          <h3>Fee Structure Breakdown</h3>
          {Object.keys(fees.feeStructure || {}).length > 0 ? (
            <div className="fee-items">
              {Object.entries(fees.feeStructure).map(([category, amount]) => (
                <div key={category} className="fee-item">
                  <span className="fee-item-name">{category}</span>
                  <span className="fee-item-amount">{formatCurrency(amount)}</span>
                </div>
              ))}
              <div className="fee-item" style={{ background: "#f0f0f0", fontWeight: 700 }}>
                <span className="fee-item-name">Total Due</span>
                <span className="fee-item-amount" style={{ color: "#667eea" }}>
                  {formatCurrency(fees.feeStructureTotal)}
                </span>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>No fee structure available.</p>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="fees-section">
          <h3>Payment History</h3>
          {fees.payments && fees.payments.length > 0 ? (
            <div className="payment-list">
              {fees.payments.map((payment, idx) => (
                <div key={idx} className="payment-item">
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: "#333" }}>
                      {payment.category || "Fee Payment"}
                    </p>
                    <p className="payment-date">
                      {formatDate(payment.date)}
                      {payment.note && ` - ${payment.note}`}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <span className="payment-mode">
                      {payment.mode || "N/A"}
                    </span>
                    <span className="payment-amount">
                      + {formatCurrency(payment.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No payment history yet.</p>
            </div>
          )}
        </div>

        {/* Payment Progress */}
        {fees.feeStructureTotal > 0 && (
          <div className="fees-section">
            <h3>Payment Progress</h3>
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span>Payment Status</span>
                <span style={{ fontWeight: 600 }}>
                  {Math.round((fees.paidTotal / fees.feeStructureTotal) * 100)}%
                </span>
              </div>
              <div style={{
                width: "100%",
                height: "12px",
                background: "#e0e0e0",
                borderRadius: "6px",
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${Math.min((fees.paidTotal / fees.feeStructureTotal) * 100, 100)}%`,
                  height: "100%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  transition: "width 0.3s ease"
                }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
