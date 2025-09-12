import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import "./CompetitionEdit.css";

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

interface Team {
  id: string;
  name: string;
  division?: string;
}

const CompetitionEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    type: "league",
    startDate: "",
    status: "Upcoming",
    division: "Premier"
  });
  const [availableDivisions, setAvailableDivisions] = useState<string[]>([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [teamToDelete, setTeamToDelete] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch competition data, teams, and divisions
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        // Fetch competition
        const docRef = doc(db, "competitions", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const compData = {
            id: docSnap.id,
            name: data.name || "",
            type: data.type || "league",
            teams: data.teams || 0,
            startDate: data.startDate || "",
            status: data.status || "Upcoming",
            division: data.division || "Premier",
            teamIds: data.teamIds || []
          };
          
          setCompetition(compData);
          setFormData({
            name: data.name || "",
            type: data.type || "league",
            startDate: data.startDate || "",
            status: data.status || "Upcoming",
            division: data.division || "Premier"
          });
          
          // Fetch teams in this competition
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
          }
        }
        
        // Fetch all teams and divisions
        const teamsSnapshot = await getDocs(collection(db, "teams"));
        const divisions = new Set<string>();
        const allTeamsData: any[] = [];
        
        teamsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.division) {
            divisions.add(data.division);
          }
          allTeamsData.push({
            id: doc.id,
            ...data
          });
        });
        
        setAvailableDivisions(Array.from(divisions));
        setAllTeams(allTeamsData);
        setFilteredTeams(allTeamsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!id || !competition) return;
    
    try {
      const docRef = doc(db, "competitions", id);
      // Auto-calculate teams count from teamIds
      const teamCount = competition.teamIds?.length || 0;
      
      await updateDoc(docRef, {
        ...formData,
        teams: teamCount,
        teamIds: competition.teamIds || []
      });
      navigate("/setup");
    } catch (error) {
      console.error("Error updating competition:", error);
      alert("Failed to update competition. Please try again.");
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete || !competition) return;
    
    try {
      const updatedTeamIds = competition.teamIds?.filter((id: string) => id !== teamToDelete.id) || [];
      
      await updateDoc(doc(db, "competitions", competition.id), {
        teamIds: updatedTeamIds,
        teams: updatedTeamIds.length
      });
      
      setTeams(prev => prev.filter(team => team.id !== teamToDelete.id));
      setCompetition((prev: Competition | null) => prev ? {
        ...prev,
        teamIds: updatedTeamIds,
        teams: updatedTeamIds.length
      } : null);
      
      setShowDeleteModal(false);
      setTeamToDelete(null);
    } catch (error) {
      console.error("Error removing team from competition:", error);
      alert("Failed to remove team from competition. Please try again.");
    }
  };

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const division = e.target.value;
    setSelectedDivision(division);
    
    if (division) {
      // Filter the master list of all teams by the selected division
      const filtered = allTeams.filter(team => team.division === division);
      setFilteredTeams(filtered);
    } else {
      // If no division selected, show all teams
      setFilteredTeams(allTeams);
    }
  };

  const handleAddTeam = async () => {
    if (!selectedTeam || !competition) return;
    
    try {
      const updatedTeamIds = [...(competition.teamIds || []), selectedTeam];
      
      await updateDoc(doc(db, "competitions", competition.id), {
        teamIds: updatedTeamIds,
        teams: updatedTeamIds.length
      });
      
      setCompetition({
        ...competition,
        teamIds: updatedTeamIds,
        teams: updatedTeamIds.length
      });
      
      // Find the team in our local state to avoid unnecessary Firestore call
      const teamToAdd = allTeams.find(team => team.id === selectedTeam);
      if (teamToAdd) {
        setTeams(prev => [...prev, teamToAdd]);
      } else {
        // Fallback: fetch from Firestore if not found locally
        const teamDoc = await getDoc(doc(db, "teams", selectedTeam));
        if (teamDoc.exists()) {
          setTeams(prev => [...prev, {
            id: teamDoc.id,
            ...teamDoc.data()
          }]);
        }
      }
      
      setSelectedTeam("");
      setSelectedDivision("");
      setFilteredTeams(allTeams); // Reset to show all teams
    } catch (error) {
      console.error("Error adding team to competition:", error);
      alert("Failed to add team to competition. Please try again.");
    }
  };

  const handleBackToSetup = () => {
    navigate("/setup");
  };

  // Group teams by division
  const teamsByDivision = teams.reduce((acc, team) => {
    const division = team.division || "Unknown Division";
    if (!acc[division]) {
      acc[division] = [];
    }
    acc[division].push(team);
    return acc;
  }, {} as Record<string, Team[]>);

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
  {filteredTeams
    .filter(team => !competition?.teamIds?.includes(team.id)) // This line filters out already added teams
    .map(team => (
      <option key={team.id} value={team.id}>
        {team.name}
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
          <h2>Teams in this Competition ({teams.length})</h2>
          
          {Object.keys(teamsByDivision).length === 0 ? (
            <p className="no-teams">No teams found for this competition.</p>
          ) : (
            <div className="teams-by-division">
              {Object.entries(teamsByDivision as Record<string, Team[]>).map(([division, divisionTeams]) => (
                <div key={division} className="division-group">
                  <h3 className="division-title">{division}</h3>
                  <div className="division-teams">
                    {divisionTeams.map(team => (
                      <div key={team.id} className="team-card">
                        <div className="team-info">
                          <h4>{team.name}</h4>
                          {/* Removed club ID display as requested */}
                        </div>
                        <button 
                          className="delete-team-btn"
                          onClick={() => {
                            setTeamToDelete(team);
                            setShowDeleteModal(true);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Team Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal delete-confirm-modal">
            <div className="modal-header">
              <h3>Confirm Remove Team</h3>
              <button
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <p>
                Are you sure you want to remove <strong>{teamToDelete?.name}</strong> from this competition?
              </p>
              <p>
                This action cannot be undone.
              </p>
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn modal-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn modal-delete"
                onClick={handleDeleteTeam}
              >
                Remove Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitionEdit;