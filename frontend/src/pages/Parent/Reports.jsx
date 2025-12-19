import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/Parent.css";

const API_BASE = "http://localhost:5000/api/parent";

export default function Reports() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "marks");
  const [marks, setMarks] = useState(null);
  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "parent") {
      navigate("/login");
      return;
    }
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [marksRes, feesRes] = await Promise.all([
        axios.get(`${API_BASE}/${user.id}/marks`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/${user.id}/fees`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setMarks(marksRes.data);
      setFees(feesRes.data);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="parent-page">
        <div className="parent-loading">
          <div className="loading-spinner"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  const getPercentage = (marks, total) => {
    const percent = (marks / total) * 100;
    return Math.round(percent);
  };

  const getGradeClass = (percentage) => {
    if (percentage >= 90) return "excellent";
    if (percentage >= 75) return "good";
    return "average";
  };

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

  return (
    <div className="parent-page">
      <div className="parent-container">
        {/* Header */}
        <div className="parent-header">
          <div className="parent-header-info">
            <h1>Academic & Fee Reports</h1>
            <p>Comprehensive progress report for {marks?.student?.name}</p>
          </div>
          <div className="parent-header-actions">
            <button className="btn-ghost" onClick={() => navigate("/parent/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="parent-tabs">
          <button
            className={`parent-tab ${activeTab === "marks" ? "active" : ""}`}
            onClick={() => setActiveTab("marks")}
          >
            📊 Marks & Performance
          </button>
          <button
            className={`parent-tab ${activeTab === "fees" ? "active" : ""}`}
            onClick={() => setActiveTab("fees")}
          >
            💳 Fee Status
          </button>
        </div>

        {/* Marks Tab */}
        {activeTab === "marks" && marks && (
          <>
            {/* Attendance Card */}
            {marks.attendance && (
              <div className="attendance-section">
                <h3>Attendance Record</h3>
                <div className="attendance-grid">
                  <div className={`attendance-card ${marks.attendance.percentage >= 80 ? "high" : ""}`}>
                    <h4>Present Days</h4>
                    <p className="attendance-value">{marks.attendance.presentDays}</p>
                  </div>
                  <div className="attendance-card">
                    <h4>Total Days</h4>
                    <p className="attendance-value">{marks.attendance.totalDays}</p>
                  </div>
                  <div className={`attendance-card ${marks.attendance.percentage >= 80 ? "high" : ""}`}>
                    <h4>Attendance %</h4>
                    <p className="attendance-value">{marks.attendance.percentage}%</p>
                  </div>
                </div>
              </div>
            )}

            {/* Exam Results */}
            <div className="marks-section">
              <h3>Exam Results</h3>
              {marks.exams && marks.exams.length > 0 ? (
                marks.exams.map((exam, idx) => {
                  const subjectMarks = exam.subjects.map((s) => getPercentage(s.marks, s.totalMarks));
                  const avgPercentage = Math.round(
                    subjectMarks.reduce((a, b) => a + b, 0) / subjectMarks.length
                  );
                  return (
                    <div key={idx} className="exam-card">
                      <div className="exam-header">
                        <p className="exam-title">{exam.name}</p>
                        <p className="exam-date">{formatDate(exam.date)}</p>
                      </div>

                      <table className="marks-table">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Marks Obtained</th>
                            <th>Total Marks</th>
                            <th>Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exam.subjects.map((subject, sidx) => {
                            const percentage = getPercentage(subject.marks, subject.totalMarks);
                            const gradeClass = getGradeClass(percentage);
                            return (
                              <tr key={sidx}>
                                <td>{subject.name}</td>
                                <td className="marks-value">{subject.marks}</td>
                                <td className="marks-value">{subject.totalMarks}</td>
                                <td>
                                  <span className={`marks-percentage ${gradeClass}`}>
                                    {percentage}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      <div style={{ marginTop: "1rem", textAlign: "right" }}>
                        <strong>Average: </strong>
                        <span className={`marks-percentage ${getGradeClass(avgPercentage)}`}>
                          {avgPercentage}%
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <p>No exam results available yet.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Fees Tab */}
        {activeTab === "fees" && fees && (
          <div className="fees-section">
            {/* Fee Summary Cards */}
            <div className="fees-summary">
              <div className="fee-card">
                <h4>Total Due</h4>
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
                <h4>Amount Pending</h4>
                <p className="fee-value">
                  {formatCurrency(fees.pendingAmount)}
                </p>
                {fees.pendingAmount > 0 && (
                  <small>Please pay before due date</small>
                )}
              </div>
            </div>

            {/* Fee Structure */}
            {Object.keys(fees.feeStructure || {}).length > 0 && (
              <div className="fee-structure">
                <h4>Fee Structure for Class {fees.student.class}</h4>
                <div className="fee-items">
                  {Object.entries(fees.feeStructure).map(([category, amount]) => (
                    <div key={category} className="fee-item">
                      <span className="fee-item-name">{category}</span>
                      <span className="fee-item-amount">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment History */}
            {fees.payments && fees.payments.length > 0 && (
              <div className="payment-history">
                <h4>Payment History</h4>
                <div className="payment-list">
                  {fees.payments.map((payment, idx) => (
                    <div key={idx} className="payment-item">
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: "#333" }}>
                          {payment.category || "Fee Payment"}
                        </p>
                        <p className="payment-date">{formatDate(payment.date)}</p>
                      </div>
                      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <span className="payment-mode">
                          {payment.mode || "Unknown"}
                        </span>
                        <span className="payment-amount">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {fees.payments && fees.payments.length === 0 && (
              <div className="empty-state">
                <p>No payment history available.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
