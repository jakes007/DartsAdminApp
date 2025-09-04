import { useState, useEffect, useRef } from "react";

interface Team {
  id: string;
  name: string;
}

interface CreateLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  onCreateLeague: (data: {
    division: string;
    startDate: Date;
    teams: string[];
  }) => void;
}

const CreateLeagueModal = ({
  isOpen,
  onClose,
  teams,
  onCreateLeague,
}: CreateLeagueModalProps) => {
  const [division, setDivision] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);

  const teamDropdownRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDivision("");
      setSelectedDate(null);
      setSelectedTeams([]);
      setCurrentMonth(new Date().getMonth());
      setCurrentYear(new Date().getFullYear());
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

  if (!isOpen) return null;

  // Calendar functions
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

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

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleTeamDropdownToggle = () => {
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
    onClose();
  };

  // Generate calendar days
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Add cells for each day of the month
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
                onChange={(e) => setDivision(e.target.value)}
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

            {/* Team Selection - Updated to dropdown */}
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
                  {teams.length === 0 ? (
                    <div className="no-teams-message">
                      No teams available. Please create teams first.
                    </div>
                  ) : (
                    teams.map((team) => (
                      <div
                        key={team.id}
                        className={`team-dropdown-item ${
                          selectedTeams.includes(team.id) ? "selected" : ""
                        }`}
                        onClick={() => handleTeamSelect(team.id)}
                      >
                        <span className="team-checkbox">
                          {selectedTeams.includes(team.id) && (
                            <span className="checkmark">✓</span>
                          )}
                        </span>
                        <span className="team-name">{team.name}</span>
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
                    const team = teams.find((t) => t.id === teamId);
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
