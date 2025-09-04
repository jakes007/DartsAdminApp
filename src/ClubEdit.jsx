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

  // Team management state
  const [addTeamModalOpen, setAddTeamModalOpen] = useState(false);
  const [currentClubForTeam, setCurrentClubForTeam] = useState(null);
  const [teamForm, setTeamForm] = useState({
    name: "",
    division: "Premier",
  });
  const [teamsToAdd, setTeamsToAdd] = useState([]);

  // Player management state
  const [addPlayerModalOpen, setAddPlayerModalOpen] = useState(false);
  const [currentClubForPlayer, setCurrentClubForPlayer] = useState(null);
  const [playerForm, setPlayerForm] = useState({
    name: "",
    surname: "",
    cellphone: "",
    dsaNumber: "",
    team: "",
  });
  const [playersToAdd, setPlayersToAdd] = useState([]);

  // View teams state
  const [viewTeamsModalOpen, setViewTeamsModalOpen] = useState(false);
  const [clubToView, setClubToView] = useState(null);

  // Player edit/delete state
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [deleteConfirmPlayer, setDeleteConfirmPlayer] = useState(null);
  const [editPlayerForm, setEditPlayerForm] = useState({
    name: "",
    surname: "",
    cellphone: "",
    dsaNumber: "",
    team: "",
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

  const handlePlayerEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditPlayerForm({
      ...editPlayerForm,
      [name]: value,
    });
  };

  const handleRegisterClub = (e) => {
    e.preventDefault();
    if (newClub.name && newClub.email && newClub.code) {
      setClubs([
        ...clubs,
        {
          ...newClub,
          id: Date.now(),
          teams: [],
          players: [],
        },
      ]);
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
          club.id === editingClub.id
            ? {
                ...editFormData,
                id: club.id,
                teams: club.teams,
                players: club.players,
              }
            : club
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

  // Team management functions
  const openAddTeamModal = (club) => {
    setCurrentClubForTeam(club);
    setTeamsToAdd([]); // Clear the list when opening modal
    setTeamForm({ name: "", division: "Premier" });
    setAddTeamModalOpen(true);
  };

  const handleTeamInputChange = (e) => {
    const { name, value } = e.target;
    setTeamForm({
      ...teamForm,
      [name]: value,
    });
  };

  const addTeamToList = () => {
    if (
      teamForm.name &&
      !teamsToAdd.some((team) => team.name === teamForm.name)
    ) {
      setTeamsToAdd([...teamsToAdd, { ...teamForm, id: Date.now() }]);
      setTeamForm({ name: "", division: "Premier" });
    }
  };

  const removeTeamFromList = (id) => {
    setTeamsToAdd(teamsToAdd.filter((team) => team.id !== id));
  };

  const saveTeams = () => {
    if (currentClubForTeam) {
      setClubs(
        clubs.map((club) =>
          club.id === currentClubForTeam.id
            ? { ...club, teams: [...club.teams, ...teamsToAdd] } // Append to existing teams
            : club
        )
      );
      setAddTeamModalOpen(false);
      setTeamForm({ name: "", division: "Premier" });
      setTeamsToAdd([]); // Clear the teams to be registered list
    }
  };

  // Player management functions
  const openAddPlayerModal = (club) => {
    if (!club.teams || club.teams.length === 0) {
      alert("Please add at least one team before adding players.");
      return;
    }

    setCurrentClubForPlayer(club);
    setPlayersToAdd([]); // Clear the list when opening modal
    setPlayerForm({
      name: "",
      surname: "",
      cellphone: "",
      dsaNumber: "",
      team: club.teams[0]?.name || "",
    });
    setAddPlayerModalOpen(true);
  };

  const handlePlayerInputChange = (e) => {
    const { name, value } = e.target;
    setPlayerForm({
      ...playerForm,
      [name]: value,
    });
  };

  const addPlayerToList = () => {
    if (playerForm.name && playerForm.surname && playerForm.team) {
      setPlayersToAdd([
        ...playersToAdd,
        {
          ...playerForm,
          id: Date.now(),
          onLoan: false,
          originalTeam: playerForm.team,
          loanedTo: null,
        },
      ]);
      setPlayerForm({
        name: "",
        surname: "",
        cellphone: "",
        dsaNumber: "",
        team: currentClubForPlayer.teams[0]?.name || "",
      });
    }
  };

  const removePlayerFromList = (id) => {
    setPlayersToAdd(playersToAdd.filter((player) => player.id !== id));
  };

  const savePlayers = () => {
    if (currentClubForPlayer) {
      setClubs(
        clubs.map((club) =>
          club.id === currentClubForPlayer.id
            ? { ...club, players: [...club.players, ...playersToAdd] } // Append to existing players
            : club
        )
      );
      setAddPlayerModalOpen(false);
      setPlayerForm({
        name: "",
        surname: "",
        cellphone: "",
        dsaNumber: "",
        team: "",
      });
      setPlayersToAdd([]); // Clear the players to be registered list
    }
  };

  // View teams functions
  const openViewTeamsModal = (club) => {
    setClubToView(club);
    setViewTeamsModalOpen(true);
  };

  // Player edit/delete functions
  const openEditPlayerModal = (player) => {
    setEditingPlayer(player);
    setEditPlayerForm({
      name: player.name,
      surname: player.surname,
      cellphone: player.cellphone || "",
      dsaNumber: player.dsaNumber || "",
      team: player.team,
    });
  };

  const savePlayerEdit = () => {
    if (editingPlayer && clubToView) {
      const updatedPlayers = clubToView.players.map((player) =>
        player.id === editingPlayer.id
          ? {
              ...editPlayerForm,
              id: player.id,
              onLoan: player.onLoan,
              originalTeam: player.originalTeam,
              loanedTo: player.loanedTo,
            }
          : player
      );

      setClubs(
        clubs.map((club) =>
          club.id === clubToView.id
            ? { ...club, players: updatedPlayers }
            : club
        )
      );
      setClubToView({ ...clubToView, players: updatedPlayers });
      setEditingPlayer(null);
    }
  };

  const handleDeletePlayer = (playerId) => {
    if (clubToView) {
      const updatedPlayers = clubToView.players.filter(
        (player) => player.id !== playerId
      );
      setClubs(
        clubs.map((club) =>
          club.id === clubToView.id
            ? { ...club, players: updatedPlayers }
            : club
        )
      );
      setClubToView({ ...clubToView, players: updatedPlayers });
      setDeleteConfirmPlayer(null);
    }
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
            <p className="summary-count">
              {clubs.reduce(
                (total, club) => total + (club.teams?.length || 0),
                0
              )}
            </p>
          </div>
          <div className="summary-tile">
            <h3>Players</h3>
            <p className="summary-count">
              {clubs.reduce(
                (total, club) => total + (club.players?.length || 0),
                0
              )}
            </p>
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
                    {club.teams && club.teams.length > 0 && (
                      <button
                        className="view-teams-link"
                        onClick={() => openViewTeamsModal(club)}
                      >
                        View Teams ({club.teams.length})
                      </button>
                    )}
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
                    <button
                      className="action-btn add-team-btn"
                      onClick={() => openAddTeamModal(club)}
                    >
                      Add Team
                    </button>
                    <button
                      className={`action-btn add-player-btn ${
                        !club.teams || club.teams.length === 0 ? "disabled" : ""
                      }`}
                      onClick={() => openAddPlayerModal(club)}
                      title={
                        !club.teams || club.teams.length === 0
                          ? "Please add a team first"
                          : "Add Player"
                      }
                    >
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
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button
                className="modal-close"
                onClick={() => setDeleteConfirmClub(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete {deleteConfirmClub.name}?</p>
              <p>This action cannot be undone.</p>
            </div>
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
          <div className="modal edit-modal">
            <div className="modal-header">
              <h3>Edit Club Details</h3>
              <button
                className="modal-close"
                onClick={() => setEditingClub(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-form compact-form">
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

      {/* Add Team Modal */}
      {addTeamModalOpen && (
        <div className="modal-overlay">
          <div className="modal team-modal">
            <div className="modal-header">
              <h3>Add Teams to {currentClubForTeam?.name}</h3>
              <button
                className="modal-close"
                onClick={() => setAddTeamModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-form compact-form">
                <div className="form-group">
                  <label htmlFor="teamName">Team Name</label>
                  <input
                    type="text"
                    id="teamName"
                    name="name"
                    value={teamForm.name}
                    onChange={handleTeamInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="teamDivision">Division</label>
                  <select
                    id="teamDivision"
                    name="division"
                    value={teamForm.division}
                    onChange={handleTeamInputChange}
                  >
                    <option value="Premier">Premier</option>
                    <option value="1st Div.">1st Div.</option>
                    <option value="2nd Div.">2nd Div.</option>
                    <option value="3rd Div.">3rd Div.</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="modal-btn add-another-btn"
                  onClick={addTeamToList}
                >
                  Add Team to List
                </button>
              </div>

              {teamsToAdd.length > 0 && (
                <div className="teams-list">
                  <h4>Teams to be registered:</h4>
                  {teamsToAdd.map((team) => (
                    <div key={team.id} className="team-item">
                      <span>
                        {team.name} ({team.division})
                      </span>
                      <button
                        className="remove-item-btn"
                        onClick={() => removeTeamFromList(team.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button
                className="modal-btn modal-cancel"
                onClick={() => setAddTeamModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn modal-confirm"
                onClick={saveTeams}
                disabled={teamsToAdd.length === 0}
              >
                Register Teams
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Player Modal */}
      {addPlayerModalOpen && (
        <div className="modal-overlay">
          <div className="modal player-modal">
            <div className="modal-header">
              <h3>Add Players to {currentClubForPlayer?.name}</h3>
              <button
                className="modal-close"
                onClick={() => setAddPlayerModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-form compact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="playerName">Name</label>
                    <input
                      type="text"
                      id="playerName"
                      name="name"
                      value={playerForm.name}
                      onChange={handlePlayerInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="playerSurname">Surname</label>
                    <input
                      type="text"
                      id="playerSurname"
                      name="surname"
                      value={playerForm.surname}
                      onChange={handlePlayerInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="playerCellphone">Cellphone</label>
                    <input
                      type="tel"
                      id="playerCellphone"
                      name="cellphone"
                      value={playerForm.cellphone}
                      onChange={handlePlayerInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="playerDsaNumber">DSA Number</label>
                    <input
                      type="text"
                      id="playerDsaNumber"
                      name="dsaNumber"
                      value={playerForm.dsaNumber}
                      onChange={handlePlayerInputChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="playerTeam">Team</label>
                  <select
                    id="playerTeam"
                    name="team"
                    value={playerForm.team}
                    onChange={handlePlayerInputChange}
                  >
                    {currentClubForPlayer?.teams?.map((team) => (
                      <option key={team.id} value={team.name}>
                        {team.name} ({team.division})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="modal-btn add-another-btn"
                  onClick={addPlayerToList}
                >
                  Add Player to List
                </button>
              </div>

              {playersToAdd.length > 0 && (
                <div className="players-list">
                  <h4>Players to be registered:</h4>
                  {playersToAdd.map((player) => (
                    <div key={player.id} className="player-item">
                      <span>
                        {player.name} {player.surname} - {player.team}
                      </span>
                      <button
                        className="remove-item-btn"
                        onClick={() => removePlayerFromList(player.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button
                className="modal-btn modal-cancel"
                onClick={() => setAddPlayerModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn modal-confirm"
                onClick={savePlayers}
                disabled={playersToAdd.length === 0}
              >
                Register Players
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Teams Modal */}
      {viewTeamsModalOpen && (
        <div className="modal-overlay">
          <div className="modal view-teams-modal">
            <div className="modal-header">
              <h3>{clubToView?.name} - Teams & Players</h3>
              <button
                className="modal-close"
                onClick={() => setViewTeamsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="divisions-list">
                {["Premier", "1st Div.", "2nd Div.", "3rd Div."].map(
                  (division) => {
                    const divisionTeams =
                      clubToView?.teams?.filter(
                        (team) => team.division === division
                      ) || [];

                    if (divisionTeams.length === 0) return null;

                    return (
                      <div key={division} className="division-group">
                        <h4>{division}</h4>
                        {divisionTeams.map((team) => {
                          const teamPlayers =
                            clubToView?.players?.filter(
                              (player) => player.team === team.name
                            ) || [];

                          return (
                            <div key={team.id} className="team-section">
                              <h5 className="team-subtitle">{team.name}</h5>
                              {teamPlayers.length > 0 ? (
                                <div className="players-container">
                                  {teamPlayers.map((player) => (
                                    <div key={player.id} className="player-row">
                                      <div className="player-info">
                                        {player.name} {player.surname}
                                        {player.cellphone &&
                                          ` • ${player.cellphone}`}
                                        {player.dsaNumber &&
                                          ` • DSA: ${player.dsaNumber}`}
                                      </div>
                                      <div className="player-actions">
                                        <button
                                          className="edit-player-btn"
                                          onClick={() =>
                                            openEditPlayerModal(player)
                                          }
                                        >
                                          Edit
                                        </button>
                                        <button
                                          className="delete-player-btn"
                                          onClick={() =>
                                            setDeleteConfirmPlayer(player)
                                          }
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="no-players">
                                  No players registered for this team
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="modal-btn modal-confirm"
                onClick={() => setViewTeamsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Player Modal */}
      {editingPlayer && (
        <div className="modal-overlay">
          <div className="modal edit-player-modal">
            <div className="modal-header">
              <h3>Edit Player Details</h3>
              <button
                className="modal-close"
                onClick={() => setEditingPlayer(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-form compact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="editPlayerName">Name</label>
                    <input
                      type="text"
                      id="editPlayerName"
                      name="name"
                      value={editPlayerForm.name}
                      onChange={handlePlayerEditInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editPlayerSurname">Surname</label>
                    <input
                      type="text"
                      id="editPlayerSurname"
                      name="surname"
                      value={editPlayerForm.surname}
                      onChange={handlePlayerEditInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="editPlayerCellphone">Cellphone</label>
                    <input
                      type="tel"
                      id="editPlayerCellphone"
                      name="cellphone"
                      value={editPlayerForm.cellphone}
                      onChange={handlePlayerEditInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editPlayerDsaNumber">DSA Number</label>
                    <input
                      type="text"
                      id="editPlayerDsaNumber"
                      name="dsaNumber"
                      value={editPlayerForm.dsaNumber}
                      onChange={handlePlayerEditInputChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="editPlayerTeam">Team</label>
                  <select
                    id="editPlayerTeam"
                    name="team"
                    value={editPlayerForm.team}
                    onChange={handlePlayerEditInputChange}
                  >
                    {clubToView?.teams?.map((team) => (
                      <option key={team.id} value={team.name}>
                        {team.name} ({team.division})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="modal-btn modal-cancel"
                onClick={() => setEditingPlayer(null)}
              >
                Cancel
              </button>
              <button
                className="modal-btn modal-confirm"
                onClick={savePlayerEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Player Confirmation Modal */}
      {deleteConfirmPlayer && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button
                className="modal-close"
                onClick={() => setDeleteConfirmPlayer(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>
                Are you sure you want to delete {deleteConfirmPlayer.name}{" "}
                {deleteConfirmPlayer.surname}?
              </p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button
                className="modal-btn modal-cancel"
                onClick={() => setDeleteConfirmPlayer(null)}
              >
                Cancel
              </button>
              <button
                className="modal-btn modal-confirm"
                onClick={() => handleDeletePlayer(deleteConfirmPlayer.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubEdit;
