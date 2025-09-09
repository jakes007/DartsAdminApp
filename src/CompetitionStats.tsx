import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "./CompetitionStats.css";

interface PlayerStats {
  id: string;
  playerName: string;
  matchesPlayed: number;
  legsWon: number;
  legsLost: number;
  tons: number;
  ton80s: number;
  dartsUsed: number;
  winPercentage: number;
  average: number;
}

interface StatsField {
  key: string;
  label: string;
  description: string;
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
      playerName: "Player One",
      matchesPlayed: 10,
      legsWon: 25,
      legsLost: 15,
      tons: 12,
      ton80s: 3,
      dartsUsed: 450,
      winPercentage: 62.5,
      average: 65.2,
    },
    {
      id: "2",
      playerName: "Player Two",
      matchesPlayed: 9,
      legsWon: 20,
      legsLost: 16,
      tons: 8,
      ton80s: 1,
      dartsUsed: 420,
      winPercentage: 55.6,
      average: 58.7,
    },
    {
      id: "3",
      playerName: "Player Three",
      matchesPlayed: 11,
      legsWon: 28,
      legsLost: 17,
      tons: 15,
      ton80s: 4,
      dartsUsed: 480,
      winPercentage: 62.2,
      average: 67.8,
    },
  ];

  // Stats configuration - dynamic from location.state or fallback to default
  const competitionStatsConfig: StatsField[] = location.state?.statsConfig || [
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

  const handleBackToSetup = () => {
    navigate("/setup");
  };

  // Tooltip component
  const Tooltip = ({ description }: { description: string }) => {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showTooltip = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsVisible(true);
    };

    const hideTooltip = () => {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 100);
    };

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return (
      <span 
        className="tooltip-container"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        <button
          className="info-icon"
          onClick={() => setIsVisible(!isVisible)}
          aria-label="Show description"
        >
          i
        </button>
        {isVisible && <div className="tooltip">{description}</div>}
      </span>
    );
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
                {competitionStatsConfig.map((field) => (
                  <th key={field.key}>
                    <div className="column-header">
                      <span>{field.label}</span>
                      <Tooltip description={field.description} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockPlayerStats.map((player) => (
                <tr key={player.id}>
                  {competitionStatsConfig.map((field) => (
                    <td key={`${player.id}-${field.key}`}>
                      {player[field.key as keyof PlayerStats]}
                    </td>
                  ))}
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