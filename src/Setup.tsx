import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateLeagueModal from "./components/CreateLeagueModal";
import "./Setup.css";
import { Link } from "react-router-dom";

// Define the Competition type
interface Competition {
  id: number;
  name: string;
  type: string;
  teams: number;
  startDate: string;
  status: string;
  division?: string;
}

// This would typically come from your data store
const mockTeams = [
  { id: "1", name: "Team Alpha" },
  { id: "2", name: "Team Beta" },
  { id: "3", name: "Team Gamma" },
  { id: "4", name: "Team Delta" },
  { id: "5", name: "Team Epsilon" },
  { id: "6", name: "Team Zeta" },
];

const Setup = () => {
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState<Competition[]>([
    {
      id: 1,
      name: "Premier League",
      type: "league",
      teams: 12,
      startDate: "2023-09-15",
      status: "Active",
      division: "Premier",
    },
    {
      id: 2,
      name: "Summer Cup",
      type: "tournament",
      teams: 8,
      startDate: "2023-07-01",
      status: "Completed",
    },
  ]);
  const [isCreateLeagueModalOpen, setIsCreateLeagueModalOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] =
    useState<Competition | null>(null);
  const [deleteConfirmCompetition, setDeleteConfirmCompetition] =
    useState<Competition | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    type: "league",
    teams: 0,
    startDate: "",
    status: "Upcoming",
    division: "Premier",
  });

  // Update edit form when competition changes
  useEffect(() => {
    if (editingCompetition) {
      setEditFormData({
        name: editingCompetition.name,
        type: editingCompetition.type,
        teams: editingCompetition.teams,
        startDate: editingCompetition.startDate,
        status: editingCompetition.status,
        division: editingCompetition.division || "Premier",
      });
    }
  }, [editingCompetition]);

  const handleBackToAdmin = () => {
    navigate("/admin");
  };

  const handleLogout = () => {
    navigate("/");
  };

  const handleCreateLeague = () => {
    setIsCreateLeagueModalOpen(true);
  };

  const handleCreateTournament = () => {
    console.log("Create Tournament clicked");
    // Will implement tournament creation functionality later
  };

  const handleLeagueCreation = (leagueData: {
    division: string;
    startDate: Date;
    teams: string[];
  }) => {
    // This is where you would connect to Firestore
    console.log("Creating league with data:", leagueData);

    // For now, just add to local state
    const newLeague: Competition = {
      id: Date.now(),
      name: `${leagueData.division} League`,
      type: "league",
      teams: leagueData.teams.length,
      startDate: leagueData.startDate.toISOString().split("T")[0],
      status: "Upcoming",
      division: leagueData.division,
    };

    setLeagues([...leagues, newLeague]);
  };

  const handleEditCompetition = (competition: Competition) => {
    setEditingCompetition(competition);
  };

  const handleDeleteCompetition = (competition: Competition) => {
    setDeleteConfirmCompetition(competition);
  };

  const confirmDeleteCompetition = () => {
    if (deleteConfirmCompetition) {
      setLeagues(
        leagues.filter((league) => league.id !== deleteConfirmCompetition.id)
      );
      setDeleteConfirmCompetition(null);
    }
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: name === "teams" ? parseInt(value) : value,
    });
  };

  const handleSaveEdit = () => {
    if (editingCompetition) {
      const updatedLeagues = leagues.map((league) =>
        league.id === editingCompetition.id
          ? { ...editingCompetition, ...editFormData }
          : league
      );

      setLeagues(updatedLeagues);
      setEditingCompetition(null);
    }
  };

  return (
    <div className="setup-container">
      <header className="setup-header">
        <div className="header-left">
          <button className="back-btn" onClick={handleBackToAdmin}>
            <span className="back-text">Back to Admin</span>
            <span className="back-arrow">←</span>
          </button>
        </div>

        <h1>Setup</h1>

        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-text">Log Out</span>
            <span className="logout-icon">⎋</span>
          </button>
        </div>
      </header>

      <main className="setup-main">
        {/* Action Tiles */}
        <div className="setup-actions">
          <div className="action-tile" onClick={handleCreateLeague}>
            <h2>Create League</h2>
            <p>Set up a new league competition</p>
          </div>

          <div className="action-tile" onClick={handleCreateTournament}>
            <h2>Create Tournament</h2>
            <p>Set up a knockout tournament</p>
          </div>
        </div>

        {/* Competitions List */}
        <div className="competitions-section">
          <h2>Your Competitions</h2>

          {leagues.length === 0 ? (
            <p className="no-competitions">No competitions created yet</p>
          ) : (
            <div className="competitions-list">
              {leagues.map((competition) => (
                <div key={competition.id} className="competition-tile">
                  <div className="competition-header">
                    <h3>{competition.name}</h3>
                    <span
                      className={`status-badge ${competition.status.toLowerCase()}`}
                    >
                      {competition.status}
                    </span>
                  </div>

                  <div className="competition-details">
                    <div className="detail-item">
                      <span className="detail-label">Type:</span>
                      <span className="detail-value">{competition.type}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Teams:</span>
                      <span className="detail-value">{competition.teams}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Start Date:</span>
                      <span className="detail-value">
                        {competition.startDate}
                      </span>
                    </div>

                    {competition.division && (
                      <div className="detail-item">
                        <span className="detail-label">Division:</span>
                        <span className="detail-value">
                          {competition.division}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="competition-actions">
                    <button
                      className="edit-competition-btn"
                      onClick={() => handleEditCompetition(competition)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-competition-btn"
                      onClick={() => handleDeleteCompetition(competition)}
                    >
                      Delete
                    </button>
                    <Link
                      to={`/competition/${competition.id}`}
                      state={{ competitionName: competition.name }}
                      className="view-competition-btn"
                    >
                      View League
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create League Modal */}
      <CreateLeagueModal
        isOpen={isCreateLeagueModalOpen}
        onClose={() => setIsCreateLeagueModalOpen(false)}
        teams={mockTeams}
        onCreateLeague={handleLeagueCreation}
      />

      {/* Edit Competition Modal */}
      {editingCompetition && (
        <div className="modal-overlay">
          <div className="modal edit-competition-modal">
            <div className="modal-header">
              <h3>Edit {editingCompetition.name}</h3>
              <button
                className="modal-close"
                onClick={() => setEditingCompetition(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <form className="modal-form compact-form">
                <div className="form-group">
                  <label htmlFor="editName">Competition Name</label>
                  <input
                    type="text"
                    id="editName"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editType">Type</label>
                  <select
                    id="editType"
                    name="type"
                    value={editFormData.type}
                    onChange={handleEditInputChange}
                  >
                    <option value="league">League</option>
                    <option value="tournament">Tournament</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="editTeams">Number of Teams</label>
                  <input
                    type="number"
                    id="editTeams"
                    name="teams"
                    value={editFormData.teams}
                    onChange={handleEditInputChange}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editStartDate">Start Date</label>
                  <input
                    type="date"
                    id="editStartDate"
                    name="startDate"
                    value={editFormData.startDate}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editStatus">Status</label>
                  <select
                    id="editStatus"
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditInputChange}
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {editingCompetition.division && (
                  <div className="form-group">
                    <label htmlFor="editDivision">Division</label>
                    <select
                      id="editDivision"
                      name="division"
                      value={editFormData.division}
                      onChange={handleEditInputChange}
                    >
                      <option value="Upper Division">Upper Division</option>
                      <option value="Lower Division">Lower Division</option>
                      <option value="Premier">Premier</option>
                      <option value="1st Division">1st Division</option>
                      <option value="2nd Division">2nd Division</option>
                      <option value="3rd Division">3rd Division</option>
                    </select>
                  </div>
                )}
              </form>
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn modal-cancel"
                onClick={() => setEditingCompetition(null)}
              >
                Cancel
              </button>
              <button
                className="modal-btn modal-confirm"
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCompetition && (
        <div className="modal-overlay">
          <div className="modal delete-confirm-modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button
                className="modal-close"
                onClick={() => setDeleteConfirmCompetition(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <p>
                Are you sure you want to delete{" "}
                <strong>{deleteConfirmCompetition.name}</strong>?
              </p>
              <p>
                This action cannot be undone and all associated data will be
                permanently removed.
              </p>
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn modal-cancel"
                onClick={() => setDeleteConfirmCompetition(null)}
              >
                Cancel
              </button>
              <button
                className="modal-btn modal-delete"
                onClick={confirmDeleteCompetition}
              >
                Delete Competition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Setup;
