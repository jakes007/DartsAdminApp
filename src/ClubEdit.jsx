// File: src/ClubEdit.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ClubEdit.css";

const ClubEdit = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [newClub, setNewClub] = useState({
    name: "",
    email: "",
    code: "",
  });
  const [editingClub, setEditingClub] = useState(null);
  const [deleteConfirmClub, setDeleteConfirmClub] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    code: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClub({
      ...newClub,
      [name]: value,
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleRegisterClub = (e) => {
    e.preventDefault();
    if (newClub.name && newClub.email && newClub.code) {
      setClubs([...clubs, { ...newClub, id: Date.now() }]);
      setNewClub({ name: "", email: "", code: "" });
    }
  };

  const handleDeleteClub = (id) => {
    setClubs(clubs.filter((club) => club.id !== id));
    setDeleteConfirmClub(null);
  };

  const handleEditClub = () => {
    if (
      editingClub &&
      editFormData.name &&
      editFormData.email &&
      editFormData.code
    ) {
      setClubs(
        clubs.map((club) =>
          club.id === editingClub.id ? { ...editFormData, id: club.id } : club
        )
      );
      setEditingClub(null);
      setEditFormData({ name: "", email: "", code: "" });
    }
  };

  const handleBackToAdmin = () => {
    navigate("/admin");
  };

  const handleLogout = () => {
    navigate("/");
  };

  const openEditModal = (club) => {
    setEditingClub(club);
    setEditFormData({
      name: club.name,
      email: club.email,
      code: club.code,
    });
  };

  const openDeleteModal = (club) => {
    setDeleteConfirmClub(club);
  };

  // Sort clubs alphabetically by name
  const sortedClubs = [...clubs].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="club-edit-container">
      <header className="club-edit-header">
        <div className="header-left">
          <button className="back-btn" onClick={handleBackToAdmin}>
            <span className="back-text">Back to Admin</span>
            <span className="back-arrow">←</span>
          </button>
        </div>

        <h1>Manage</h1>

        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-text">Log Out</span>
            <span className="logout-icon">⎋</span>
          </button>
        </div>
      </header>

      <main className="club-edit-main">
        {/* Registration Tile */}
        <div className="register-tile">
          <h2>REGISTER</h2>
          <form onSubmit={handleRegisterClub} className="register-form">
            <div className="form-group">
              <label htmlFor="clubName">Name Of Club</label>
              <input
                type="text"
                id="clubName"
                name="name"
                value={newClub.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="clubEmail">Email Address</label>
              <input
                type="email"
                id="clubEmail"
                name="email"
                value={newClub.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="clubCode">Unique Club Code</label>
              <input
                type="text"
                id="clubCode"
                name="code"
                value={newClub.code}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="register-button">
              Register Club
            </button>
          </form>
        </div>

        {/* Summary Tiles */}
        <div className="summary-tiles">
          <div className="summary-tile">
            <h3>Clubs</h3>
            <p className="summary-count">{clubs.length}</p>
          </div>
          <div className="summary-tile">
            <h3>Teams</h3>
            <p className="summary-count">0</p>
          </div>
          <div className="summary-tile">
            <h3>Players</h3>
            <p className="summary-count">0</p>
          </div>
          <div className="summary-tile">
            <h3>Loaned</h3>
            <p className="summary-count">0</p>
          </div>
        </div>

        {/* Clubs List Tile */}
        <div className="clubs-list-tile">
          <h2>Registered Clubs</h2>
          {sortedClubs.length === 0 ? (
            <p className="no-clubs">No clubs registered yet</p>
          ) : (
            <div className="clubs-list">
              {sortedClubs.map((club) => (
                <div key={club.id} className="club-item">
                  <div className="club-info">
                    <h3>{club.name}</h3>
                    <p>
                      {club.email} | Code: {club.code}
                    </p>
                  </div>
                  <div className="club-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => openEditModal(club)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => openDeleteModal(club)}
                    >
                      Delete
                    </button>
                    <button className="action-btn add-team-btn">
                      Add Team
                    </button>
                    <button className="action-btn add-player-btn">
                      Add Player
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmClub && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete {deleteConfirmClub.name}?</p>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="modal-btn modal-cancel"
                onClick={() => setDeleteConfirmClub(null)}
              >
                Cancel
              </button>
              <button
                className="modal-btn modal-confirm"
                onClick={() => handleDeleteClub(deleteConfirmClub.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Club Modal */}
      {editingClub && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Club</h3>
            <div className="modal-form">
              <div className="form-group">
                <label htmlFor="editClubName">Name Of Club</label>
                <input
                  type="text"
                  id="editClubName"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="editClubEmail">Email Address</label>
                <input
                  type="email"
                  id="editClubEmail"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="editClubCode">Unique Club Code</label>
                <input
                  type="text"
                  id="editClubCode"
                  name="code"
                  value={editFormData.code}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="modal-btn modal-cancel"
                onClick={() => setEditingClub(null)}
              >
                Cancel
              </button>
              <button
                className="modal-btn modal-confirm"
                onClick={handleEditClub}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubEdit;
