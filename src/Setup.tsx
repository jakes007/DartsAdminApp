import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateLeagueModal from "./components/CreateLeagueModal";
import "./Setup.css";

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
  const [leagues, setLeagues] = useState([
    {
      id: 1,
      name: "Premier League",
      type: "league",
      teams: 12,
      startDate: "2023-09-15",
      status: "Active",
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
    const newLeague = {
      id: Date.now(),
      name: `${leagueData.division} League`,
      type: "league",
      teams: leagueData.teams.length,
      startDate: leagueData.startDate.toISOString().split("T")[0],
      status: "Upcoming",
    };

    setLeagues([...leagues, newLeague]);
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
              {leagues.map((league) => (
                <div key={league.id} className="competition-tile">
                  <div className="competition-header">
                    <h3>{league.name}</h3>
                    <span
                      className={`status-badge ${league.status.toLowerCase()}`}
                    >
                      {league.status}
                    </span>
                  </div>

                  <div className="competition-details">
                    <div className="detail-item">
                      <span className="detail-label">Type:</span>
                      <span className="detail-value">{league.type}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Teams:</span>
                      <span className="detail-value">{league.teams}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Start Date:</span>
                      <span className="detail-value">{league.startDate}</span>
                    </div>
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
    </div>
  );
};

export default Setup;
