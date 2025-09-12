import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import "./CompetitionEdit.css";

// ✅ Add this interface definition
interface Competition {
  id: string;
  name: string;
  type: string;
  teams: number;
  teamIds?: string[];
  startDate: string;
  status: string;
  division?: string;
}

const CompetitionEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [availableDivisions, setAvailableDivisions] = useState<string[]>([]);
const [selectedDivision, setSelectedDivision] = useState("");
const [availableTeams, setAvailableTeams] = useState<any[]>([]);
const [selectedTeam, setSelectedTeam] = useState("");
  const [teams, setTeams] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    type: "league",
    teams: 0,
    startDate: "",
    status: "Upcoming",
    division: "Premier"
  });

  // Add this function to handle adding a team to the competition
const handleAddTeam = async () => {
  if (!selectedTeam || !competition) return;
  
  try {
    const updatedTeamIds = [...(competition.teamIds || []), selectedTeam];
    
    // Update Firestore
    await updateDoc(doc(db, "competitions", competition.id), {
      teamIds: updatedTeamIds,
      teams: updatedTeamIds.length
    });
    
    // Update local state
    setCompetition({
      ...competition,
      teamIds: updatedTeamIds,
      teams: updatedTeamIds.length
    });
    
    // Fetch and add the team details to local teams state
    const teamDoc = await getDoc(doc(db, "teams", selectedTeam));
    if (teamDoc.exists()) {
      setTeams(prev => [...prev, {
        id: teamDoc.id,
        ...teamDoc.data()
      }]);
    }
    
    // Reset selection
    setSelectedTeam("");
    setSelectedDivision("");
  } catch (error) {
    console.error("Error adding team to competition:", error);
    alert("Failed to add team to competition. Please try again.");
  }
};

// Add this function to filter teams by division
// Change this function to be async
const handleDivisionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
  const division = e.target.value;
  setSelectedDivision(division);
  
  if (division) {
    const filtered = availableTeams.filter(team => team.division === division);
    setAvailableTeams(filtered);
  } else {
    // If no division selected, show all teams
    try {
      const teamsSnapshot = await getDocs(collection(db, "teams"));
      const allTeams: any[] = [];
      
      teamsSnapshot.forEach((doc) => {
        allTeams.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setAvailableTeams(allTeams);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  }
};

  // Fetch competition data
  // Replace the team fetching logic in the useEffect:
useEffect(() => {
  const fetchCompetition = async () => {
    if (!id) return;
    
    try {
      const docRef = doc(db, "competitions", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCompetition({ 
          id: docSnap.id, 
          name: data.name || "",
          type: data.type || "league",
          teams: data.teams || 0,
          startDate: data.startDate || "",
          status: data.status || "Upcoming",
          division: data.division || "Premier",
          teamIds: data.teamIds || [] // Add this too
        });
        setFormData({
          name: data.name || "",
          type: data.type || "league",
          teams: data.teams || 0,
          startDate: data.startDate || "",
          status: data.status || "Upcoming",
          division: data.division || "Premier"
        });

        useEffect(() => {
          const fetchDivisionsAndTeams = async () => {
            try {
              // Fetch all teams to extract unique divisions
              const teamsSnapshot = await getDocs(collection(db, "teams"));
              const divisions = new Set<string>();
              const allTeams: any[] = [];
              
              teamsSnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.division) {
                  divisions.add(data.division);
                }
                allTeams.push({
                  id: doc.id,
                  ...data
                });
              });
              
              setAvailableDivisions(Array.from(divisions));
              setAvailableTeams(allTeams);
            } catch (error) {
              console.error("Error fetching divisions and teams:", error);
            }
          };
          
          fetchDivisionsAndTeams();
        }, []);
        
        // ✅ Fetch the ACTUAL teams in this competition using teamIds
        if (data.teamIds && data.teamIds.length > 0) {
          const teamsData = [];
          for (const teamId of data.teamIds) {
            const teamDoc = await getDoc(doc(db, "teams", teamId));
            if (teamDoc.exists()) {
              teamsData.push({
                id: teamDoc.id,
                ...teamDoc.data()
              });
            }
          }
          setTeams(teamsData);
        } else if (data.division) {
          // Fallback: fetch by division (for old competitions without teamIds)
          const teamsQuery = query(
            collection(db, "teams"), 
            where("division", "==", data.division)
          );
          const teamsSnapshot = await getDocs(teamsQuery);
          const teamsData = teamsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setTeams(teamsData);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching competition:", error);
      setLoading(false);
    }
  };

  fetchCompetition();
}, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "teams" ? parseInt(value) : value
    }));
  };

  const handleSave = async () => {
    if (!id) return;
    
    try {
      const docRef = doc(db, "competitions", id);
      // Auto-calculate teams count from teamIds
      const teamCount = competition?.teamIds?.length || 0;
      
      await updateDoc(docRef, {
        ...formData,
        teams: teamCount, // Auto-calculate
        teamIds: competition?.teamIds || []
      });
      navigate("/setup");
    } catch (error) {
      console.error("Error updating competition:", error);
      alert("Failed to update competition. Please try again.");
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm("Are you sure you want to remove this team from the competition?")) {
      return;
    }
    
    try {
      if (competition?.teamIds) {
        const updatedTeamIds = competition.teamIds.filter((id: string) => id !== teamId);
        
        await updateDoc(doc(db, "competitions", competition.id), {
          teamIds: updatedTeamIds,
          teams: updatedTeamIds.length
        });
        
        setTeams(prev => prev.filter(team => team.id !== teamId));
        setCompetition((prev: Competition | null) => prev ? {
          ...prev,
          teamIds: updatedTeamIds,
          teams: updatedTeamIds.length
        } : null);
      }
    } catch (error) {
      console.error("Error removing team from competition:", error);
      alert("Failed to remove team from competition. Please try again.");
    }
  };

  const handleBackToSetup = () => {
    navigate("/setup");
  };

  if (loading) {
    return <div className="competition-edit-container">Loading...</div>;
  }

  if (!competition) {
    return <div className="competition-edit-container">Competition not found</div>;
  }

  

  return (
    <div className="competition-edit-container">
      <header className="competition-edit-header">
        <div className="header-left">
          <button className="back-btn" onClick={handleBackToSetup}>
            <span className="back-text">Back to Setup</span>
            <span className="back-arrow">←</span>
          </button>
        </div>

        <h1>Edit</h1>

        <div className="header-right">
          {/* Empty for balance */}
        </div>
      </header>

      <main className="competition-edit-main">
        <div className="edit-form-container">
          <h2>Edit Competition Details</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Competition Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="league">League</option>
                <option value="tournament">Tournament</option>
              </select>
            </div>

            

            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="division">Division</label>
              <select
                id="division"
                name="division"
                value={formData.division}
                onChange={handleInputChange}
              >
                <option value="Upper Division">Upper Division</option>
                <option value="Lower Division">Lower Division</option>
                <option value="Premier">Premier</option>
                <option value="1st Division">1st Division</option>
                <option value="2nd Division">2nd Division</option>
                <option value="3rd Division">3rd Division</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button className="cancel-btn" onClick={handleBackToSetup}>
              Cancel
            </button>
            <button className="save-btn" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>

        <div className="add-team-section">
  <h3>Add Team to Competition</h3>
  <div className="add-team-form">
    <div className="form-group">
      <label htmlFor="divisionSelect">Division</label>
      <select
        id="divisionSelect"
        value={selectedDivision}
        onChange={handleDivisionChange}
      >
        <option value="">Select Division</option>
        {availableDivisions.map(division => (
          <option key={division} value={division}>{division}</option>
        ))}
      </select>
    </div>
    
    <div className="form-group">
      <label htmlFor="teamSelect">Team</label>
      <select
        id="teamSelect"
        value={selectedTeam}
        onChange={(e) => setSelectedTeam(e.target.value)}
        disabled={!selectedDivision}
      >
        <option value="">Select Team</option>
        {availableTeams
          .filter(team => team.division === selectedDivision)
          .map(team => (
            <option key={team.id} value={team.id}>
              {team.name} ({team.clubId})
            </option>
          ))
        }
      </select>
    </div>
    
    <button
      className="add-team-btn"
      onClick={handleAddTeam}
      disabled={!selectedTeam}
    >
      Add Team
    </button>
  </div>
</div>

        <div className="teams-list-container">
          <h2>Teams in this Competition</h2>
          {teams.length === 0 ? (
            <p className="no-teams">No teams found for this division.</p>
          ) : (
            <div className="teams-grid">
              {teams.map(team => (
                <div key={team.id} className="team-card">
                  <div className="team-info">
                    <h3>{team.name}</h3>
                    <p>Division: {team.division}</p>
                    <p>Club ID: {team.clubId}</p>
                  </div>
                  <button 
                    className="delete-team-btn"
                    onClick={() => handleDeleteTeam(team.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompetitionEdit;