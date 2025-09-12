import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateLeagueModal from "./components/CreateLeagueModal";
import "./Setup.css";
import { Link } from "react-router-dom";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

interface Competition {
  id: string;
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

const Setup = () => {
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState<Competition[]>([]);
  const [isCreateLeagueModalOpen, setIsCreateLeagueModalOpen] = useState(false);
  const [deleteConfirmCompetition, setDeleteConfirmCompetition] =
    useState<Competition | null>(null);

  // Fetch Competitions from Firestore
  useEffect(() => {
    const q = query(collection(db, "competitions"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const competitionsData: Competition[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        competitionsData.push({
          id: doc.id,
          name: data.name,
          type: data.type,
          teams: data.teams,
          startDate: data.startDate,
          status: data.status,
          division: data.division,
        });
      });
      setLeagues(competitionsData);
    });

    return () => unsubscribe();
  }, []);

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
  };

  const handleLeagueCreation = async (leagueData: {
    division: string;
    startDate: Date;
    teams: string[]; // This contains the team IDs
  }) => {
    try {
      const docRef = await addDoc(collection(db, "competitions"), {
        name: `${leagueData.division} League`,
        type: "league",
        teams: leagueData.teams.length,
        teamIds: leagueData.teams, // ✅ Store the actual team IDs
        startDate: leagueData.startDate.toISOString().split("T")[0],
        status: "Upcoming",
        division: leagueData.division,
      });
      console.log("League written with ID: ", docRef.id);
      setIsCreateLeagueModalOpen(false);
    } catch (error) {
      console.error("Error adding league: ", error);
      alert("Failed to create league. Please try again.");
    }
  };

  const handleDeleteCompetition = (competition: Competition) => {
    setDeleteConfirmCompetition(competition);
  };

  const confirmDeleteCompetition = async () => {
    if (deleteConfirmCompetition) {
      try {
        await deleteDoc(doc(db, "competitions", deleteConfirmCompetition.id));
        setDeleteConfirmCompetition(null);
      } catch (error) {
        console.error("Error deleting competition: ", error);
        alert("Failed to delete competition. Please try again.");
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
            <span className="logout-icon">🔒</span>
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
  <span className="detail-value">
    {competition.type.charAt(0).toUpperCase() + competition.type.slice(1)}
  </span>
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
                      onClick={() => navigate(`/edit-competition/${competition.id}`)}
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