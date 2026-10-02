import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/General/Navigation";
import AdminReportedPosts from "../components/Admin/AdminReportedPosts";
import AdminReportReasons from "../components/Admin/AdminReportReasons";

function AdminPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("reports");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        if (!user.isAdmin) {
          navigate("/home");
        } else {
          setCurrentUser(user);
        }
      } else {
        navigate("/login");
      }
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  if (!currentUser) return null;

  return (
    <div className="app-page admin-page">
      <Navigation />
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <div className="admin-badge">ADMIN</div>
            <div>
              <h1 className="admin-title">Admin Dashboard</h1>
              <p className="admin-subtitle">Logged in as <strong>{currentUser.username}</strong></p>
            </div>
          </div>
          <div className="admin-stats-row">
            <div className="admin-stat-chip" id="admin-stat-reported">
              
              <span className="admin-stat-label">Reported Posts</span>
            </div>
            <div className="admin-stat-chip" id="admin-stat-reasons">
              <span className="admin-stat-label">Report Reasons</span>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <nav className="admin-tabs" aria-label="Admin sections">
          <button
            id="admin-tab-reports"
            className={`admin-tab-btn ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            Reported Posts
          </button>
          <button
            id="admin-tab-reasons"
            className={`admin-tab-btn ${activeTab === "reasons" ? "active" : ""}`}
            onClick={() => setActiveTab("reasons")}
          >
            Report Reasons
          </button>
        </nav>

        {/* Tab Panels */}
        <section className="admin-panel">
          {activeTab === "reports" && <AdminReportedPosts />}
          {activeTab === "reasons" && <AdminReportReasons />}
        </section>
      </main>
    </div>
  );
}

export default AdminPage;
