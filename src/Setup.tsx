
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateLeagueModal from "./components/CreateLeagueModal";
import "./Setup.css";
import { Link } from "react-router-dom";

// 1. Import Firestore functions and the `db` object
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase"; // This import already exists and is correct

// Define the Competition type
interface Competition {
  id: string; // Changed from number to string because Firestore uses string IDs
  name: string;
  type: string;
  teams: number;
  startDate: string;
  status: string;
  division?: string;
}

const competitionStatsConfig = [
  { key: "playerName", label: "PN", description: "Player Name" },
  { key: "matchesPlayed", label: "MP", description: "Matches Played" },
  { key: "legsWon", label: "LW", description: "Legs Won" },
  { key: "legsLost", label: "LL", description: "Legs Lost" },
  { key: "tons", label: "100+", description: "Scores of 100+" },
  { key: "ton80s", label: "180", description: "Scores of 180" },
  { key: "dartsUsed", label: "DU", description: "Darts Used" },
  { key: "winPercentage", label: "Win%", description: "Win Percentage" },
  { key: "average", label: "Avg", description: "3-Dart Average" },
];

// 2. REMOVED the mockTeams array. We will fetch teams from Firestore.

const Setup = () => {
  const navigate = useNavigate();
  // 3. Replace mock state with an empty array. It will be populated by Firestore.
  const [leagues, setLeagues] = useState<Competition[]>([]);
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

  // 4. Fetch Competitions from Firestore when the component loads
  useEffect(() => {
    // Create a query against the 'competitions' collection, ordered by name
    const q = query(collection(db, "competitions"), orderBy("name"));
    // `onSnapshot` sets up a real-time listener. It runs now and every time the data changes.
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const competitionsData: Competition[] = [];
      querySnapshot.forEach((doc) => {
        // doc.data() is the object containing our competition data
        const data = doc.data();
        competitionsData.push({
          id: doc.id, // Firestore's auto-generated ID
          name: data.name,
          type: data.type,
          teams: data.teams,
          startDate: data.startDate, // Ensure this is stored as a string in Firestore
          status: data.status,
          division: data.division,
        });
      });
      setLeagues(competitionsData); // Update our state with the real data
    });

    // Return a cleanup function to unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, []); // The empty dependency array means this runs once on mount.

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

  // 5. UPDATE: Save the new league to Firestore, not local state.
  const handleLeagueCreation = async (leagueData: {
    division: string;
    startDate: Date;
    teams: string[];
  }) => {
    try {
      // Add a new document to the "competitions" collection
      const docRef = await addDoc(collection(db, "competitions"), {
        name: `${leagueData.division} League`,
        type: "league",
        teams: leagueData.teams.length,
        startDate: leagueData.startDate.toISOString().split("T")[0], // Store as YYYY-MM-DD
        status: "Upcoming",
        division: leagueData.division,
        // You might also want to store the actual team IDs here later:
        // teamIds: leagueData.teams
      });
      console.log("League written with ID: ", docRef.id);

      // The `onSnapshot` listener above will automatically detect this new document
      // and update the `leagues` state, so we don't need to do it here.

      // Reset form and close modal
      setIsCreateLeagueModalOpen(false);
    } catch (error) {
      console.error("Error adding league: ", error);
      alert("Failed to create league. Please try again.");
    }
  };

  const handleEditCompetition = (competition: Competition) => {
    setEditingCompetition(competition);
  };

  const handleDeleteCompetition = (competition: Competition) => {
    setDeleteConfirmCompetition(competition);
  };

  // 6. UPDATE: Delete the competition from Firestore
  const confirmDeleteCompetition = async () => {
    if (deleteConfirmCompetition) {
      try {
        await deleteDoc(doc(db, "competitions", deleteConfirmCompetition.id));
        // The `onSnapshot` listener will automatically update the `leagues` state.
        setDeleteConfirmCompetition(null);
      } catch (error) {
        console.error("Error deleting competition: ", error);
        alert("Failed to delete competition. Please try again.");
      }
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

  // 7. UPDATE: Save the edited competition to Firestore
  const handleSaveEdit = async () => {
    if (editingCompetition) {
      try {
        // Get a reference to the existing document
        const competitionRef = doc(db, "competitions", editingCompetition.id);
        // Update the document with the new form data
        await updateDoc(competitionRef, { ...editFormData });
        // The `onSnapshot` listener will automatically update the `leagues` state.
        setEditingCompetition(null);
      } catch (error) {
        console.error("Error updating competition: ", error);
        alert("Failed to update competition. Please try again.");
      }
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
                      state={{
                        competitionName: competition.name,
                        // This would come from your competition data
                        statsConfig: competitionStatsConfig,
                      }}
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
