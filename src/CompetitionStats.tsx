import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./CompetitionStats.css";

interface PlayerStats {
  id: string;
  name: string;
  matchesPlayed: number;
  legsWon: number;
  legsLost: number;
  tonsPlus: number;
  oneEighties: number;
  dartsUsed: number;
  winPercentage: number;
  average: number;
}

const CompetitionStats = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Get competition name from navigation state or use a default
  const competitionName =
    location.state?.competitionName || `Competition ${id}`;

  // Mock data - replace with Firestore data later
  const mockPlayerStats: PlayerStats[] = [
    {
      id: "1",
      name: "Player One",
      matchesPlayed: 10,
      legsWon: 25,
      legsLost: 15,
      tonsPlus: 12,
      oneEighties: 3,
      dartsUsed: 450,
      winPercentage: 62.5,
      average: 65.2,
    },
    {
      id: "2",
      name: "Player Two",
      matchesPlayed: 9,
      legsWon: 20,
      legsLost: 16,
      tonsPlus: 8,
      oneEighties: 1,
      dartsUsed: 420,
      winPercentage: 55.6,
      average: 58.7,
    },
    {
      id: "3",
      name: "Player Three",
      matchesPlayed: 11,
      legsWon: 28,
      legsLost: 17,
      tonsPlus: 15,
      oneEighties: 4,
      dartsUsed: 480,
      winPercentage: 62.2,
      average: 67.8,
    },
  ];

  const handleBackToSetup = () => {
    navigate("/setup");
  };

  return (
    <div className="competition-stats-container">
      <header className="competition-stats-header">
        <div className="header-left">
          <button className="back-btn" onClick={handleBackToSetup}>
            <span className="back-text">Back to Setup</span>
            <span className="back-arrow">←</span>
          </button>
        </div>

        <h1>{competitionName} - Statistics</h1>

        <div className="header-right">{/* Empty for balance */}</div>
      </header>

      <main className="competition-stats-main">
        <div className="stats-table-container">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Player Name</th>
                <th>Matches Played</th>
                <th>Legs Won</th>
                <th>Legs Lost</th>
                <th>100+</th>
                <th>180s</th>
                <th>Darts Used</th>
                <th>Win %</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              {mockPlayerStats.map((player) => (
                <tr key={player.id}>
                  <td>{player.name}</td>
                  <td>{player.matchesPlayed}</td>
                  <td>{player.legsWon}</td>
                  <td>{player.legsLost}</td>
                  <td>{player.tonsPlus}</td>
                  <td>{player.oneEighties}</td>
                  <td>{player.dartsUsed}</td>
                  <td>{player.winPercentage}%</td>
                  <td>{player.average}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default CompetitionStats;
