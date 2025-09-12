import { useState, useEffect, useRef } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

interface Team {
  id: string;
  name: string;
  division: string;
  clubId: string;
  clubName: string;
}

interface CreateLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLeague: (data: {
    division: string;
    startDate: Date;
    teams: string[];
  }) => void;
}

const CreateLeagueModal = ({
  isOpen,
  onClose,
  onCreateLeague,
}: CreateLeagueModalProps) => {
  const [division, setDivision] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTeams, setAvailableTeams] = useState<
    { id: string; name: string; division: string; clubName: string }[]
  >([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [leagueTeamForm, setLeagueTeamForm] = useState({ team: "" });

  const teamDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch teams from Firestore - all teams
  // Fetch teams from Firestore - all teams
  useEffect(() => {
    if (!isOpen) return;

    setLoadingTeams(true);
    setError(null);

    try {
      const unsubscribe = onSnapshot(
        collection(db, "teams"),
        (teamsSnapshot) => {
          const allTeams: Team[] = [];

          teamsSnapshot.forEach((teamDoc) => {
            const teamData = teamDoc.data();
            allTeams.push({
              id: teamDoc.id,
              name: teamData.name || "",
              division: (teamData.division || "Unknown Division").trim(),
              clubId: teamData.clubId || "",
              clubName: "Unknown Club", // We'll need to fetch this separately
            });
          });

          setTeams(allTeams);
          setLoadingTeams(false);
        },
        (err) => {
          console.error("Error fetching teams:", err);
          setError("Failed to load teams. Please try again.");
          setLoadingTeams(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Unexpected error loading teams:", err);
      setError("Unexpected error loading teams.");
      setLoadingTeams(false);
    }
  }, [isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDivision("");
      setSelectedDate(null);
      setSelectedTeams([]);
      setCurrentMonth(new Date().getMonth());
      setCurrentYear(new Date().getFullYear());
      setAvailableTeams([]);
      setLoadingTeams(true);
      setError(null);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        teamDropdownRef.current &&
        !teamDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTeamDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- Step 3: Update available teams whenever teams or division changes ---
  // Update available teams whenever teams or division changes
  useEffect(() => {
    if (!division) {
      setAvailableTeams([]);
      return;
    }

    const filtered = teams.filter(
      (team) =>
        team.division &&
        team.division.trim().toLowerCase() === division.trim().toLowerCase()
    );

    setAvailableTeams(filtered);
  }, [teams, division]);

  if (!isOpen) return null;

  // Calendar functions
  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (month: number, year: number) =>
    new Date(year, month, 1).getDay();

  const navigateMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const navigateYear = (direction: number) => {
    setCurrentYear(currentYear + direction);
  };

  const handleDateSelect = (day: number) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
    setShowCalendar(false);
  };

  // --- NEW: handle division change ---
  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value.trim();
    setDivision(selected);
    setSelectedTeams([]);
  };

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleTeamDropdownToggle = () => {
    if (!division) {
      alert("Please select a division first");
      return;
    }
    setShowTeamDropdown(!showTeamDropdown);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!division || !selectedDate || selectedTeams.length === 0) {
      alert("Please fill in all required fields");
      return;
    }

    onCreateLeague({
      division,
      startDate: selectedDate,
      teams: selectedTeams,
    });

    // Reset form
    setDivision("");
    setSelectedDate(null);
    setSelectedTeams([]);
    setAvailableTeams([]);
    onClose();
  };

  // Generate calendar days
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected =
      selectedDate &&
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear;

    const isToday =
      day === new Date().getDate() &&
      currentMonth === new Date().getMonth() &&
      currentYear === new Date().getFullYear();

    days.push(
      <button
        key={day}
        type="button"
        className={`calendar-day ${isSelected ? "selected" : ""} ${
          isToday ? "today" : ""
        }`}
        onClick={() => handleDateSelect(day)}
      >
        {day}
      </button>
    );
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="modal-overlay">
      <div className="modal create-league-modal">
        <div className="modal-header">
          <h3>Create League</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <form onSubmit={handleSubmit} className="modal-form compact-form">
            {/* Division Selection */}
            <div className="form-group">
              <label htmlFor="divisionSelect">Division *</label>
              <select
                id="divisionSelect"
                value={division}
                onChange={handleDivisionChange}
                required
              >
                <option value="">Select Division</option>
                <option value="Upper Division">Upper Division</option>
                <option value="Lower Division">Lower Division</option>
                <option value="Premier">Premier</option>
                <option value="1st Division">1st Division</option>
                <option value="2nd Division">2nd Division</option>
                <option value="3rd Division">3rd Division</option>
              </select>
            </div>

            {/* Start Date Selection */}
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <button
                type="button"
                id="startDate"
                className="date-picker-button"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                {selectedDate
                  ? selectedDate.toLocaleDateString()
                  : "Select a date"}
              </button>

              {showCalendar && (
                <div className="calendar-container">
                  <div className="calendar-navigation">
                    <button
                      type="button"
                      onClick={() => navigateYear(-1)}
                      className="nav-button"
                    >
                      &#171;
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateMonth(-1)}
                      className="nav-button"
                    >
                      &#8249;
                    </button>

                    <span className="calendar-month-year">
                      {monthNames[currentMonth]} {currentYear}
                    </span>

                    <button
                      type="button"
                      onClick={() => navigateMonth(1)}
                      className="nav-button"
                    >
                      &#8250;
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateYear(1)}
                      className="nav-button"
                    >
                      &#187;
                    </button>
                  </div>

                  <div className="calendar-weekdays">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div key={day} className="weekday">
                          {day}
                        </div>
                      )
                    )}
                  </div>

                  <div className="calendar-grid">{days}</div>
                </div>
              )}
            </div>

            {/* Team Selection */}
            <div
              className="form-group team-selection-group"
              ref={teamDropdownRef}
            >
              <label>Select Teams *</label>
              <button
                type="button"
                className="team-dropdown-toggle"
                onClick={handleTeamDropdownToggle}
              >
                {selectedTeams.length > 0
                  ? `${selectedTeams.length} team${
                      selectedTeams.length !== 1 ? "s" : ""
                    } selected`
                  : "Select teams"}
                <span className="dropdown-arrow">▼</span>
              </button>

              {showTeamDropdown && (
                <div className="team-dropdown">
                  {error ? (
                    <div className="no-teams-message error">{error}</div>
                  ) : loadingTeams ? (
                    <div className="no-teams-message">Loading teams...</div>
                  ) : availableTeams.length === 0 ? (
                    <div className="no-teams-message">
                      {division
                        ? "No teams in this division."
                        : "Please select a division first."}
                    </div>
                  ) : availableTeams.filter(team => !selectedTeams.includes(team.id)).length === 0 ? (
                    <div className="no-teams-message">
                      All available teams have been selected.
                    </div>
                  ) : (
                    availableTeams
  .filter(team => !selectedTeams.includes(team.id)) // This line filters out selected teams
  .map((team) => (
    <div
      key={team.id}
      className="team-dropdown-item"
      onClick={() => handleTeamSelect(team.id)}
    >
      <span className="team-checkbox">
        {/* Empty checkbox for unselected teams */}
      </span>
      <span className="team-name">
        {team.name} ({team.division})
      </span>
    </div>
  ))
                  )}
                </div>
              )}
            </div>

            {/* Selected Teams List */}
            {selectedTeams.length > 0 && (
              <div className="selected-teams-section">
                <h4>Selected Teams</h4>
                <div className="selected-teams-list">
                  {selectedTeams.map((teamId) => {
                    const team = availableTeams.find((t) => t.id === teamId);
                    return (
                      <div key={teamId} className="selected-team-item">
                        <span>{team?.name}</span>
                        <button
                          type="button"
                          onClick={() => handleTeamSelect(teamId)}
                          className="remove-team-button"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="modal-btn modal-cancel"
              >
                Cancel
              </button>
              <button type="submit" className="modal-btn modal-confirm">
                Create League
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLeagueModal;
