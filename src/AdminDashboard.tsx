import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // For now, we'll just redirect to homepage
    navigate("/");
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Admin</h1>
        <button className="logout-btn" onClick={handleLogout}>
          <span className="logout-text">Log Out</span>
          <span className="back-arrow">←</span>
        </button>
      </header>

      <main className="admin-main">
        <div className="admin-grid">
          <div className="admin-tile">
            <h2>Manage</h2>
            <p>Edit Clubs, Teams, and Players.</p>
          </div>

          <div className="admin-tile">
            <h2>Stats</h2>
            <p>Detailed views of all statistics.</p>
          </div>

          <div className="admin-tile">
            <h2>Setup</h2>
            <p>Create leagues and competitions.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
