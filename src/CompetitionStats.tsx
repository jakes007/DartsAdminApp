import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "./CompetitionStats.css";
// 1. Import Firestore functions and the db object
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

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

  // 2. Replace mock data with state for real data
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

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

  // 3. Fetch player stats from Firestore
  useEffect(() => {
    if (!id) return;

    setLoading(true);

    // Query the playerStats collection for stats related to this competition
    const q = query(
      collection(db, "playerStats"),
      where("competitionId", "==", id),
      orderBy("average", "desc") // Optional: order by average descending
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const statsData: PlayerStats[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          statsData.push({
            id: doc.id,
            playerName: data.playerName || "Unknown Player",
            matchesPlayed: data.matchesPlayed || 0,
            legsWon: data.legsWon || 0,
            legsLost: data.legsLost || 0,
            tons: data.tons || 0,
            ton80s: data.ton80s || 0,
            dartsUsed: data.dartsUsed || 0,
            winPercentage: data.winPercentage || 0,
            average: data.average || 0,
          });
        });

        setPlayerStats(statsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching player stats:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  const handleBackToSetup = () => {
    navigate("/setup");
  };

  // Tooltip component (unchanged)
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
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <p>Loading statistics...</p>
            </div>
          ) : playerStats.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <p>
                No statistics available yet. No fixtures have been created for
                this competition.
              </p>
            </div>
          ) : (
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
                {playerStats.map((player) => (
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
          )}
        </div>
      </main>
    </div>
  );
};

export default CompetitionStats;
