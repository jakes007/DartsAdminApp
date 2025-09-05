import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import AdminDashboard from "./AdminDashboard";
import "./App.css";
import ClubEdit from "./ClubEdit.jsx";
import Setup from "./Setup"; // Import the new Setup component
import CompetitionStats from "./CompetitionStats";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/manage" element={<ClubEdit />} />
          <Route path="/setup" element={<Setup />} /> {/* Add the new route */}
          <Route path="/competition/:id" element={<CompetitionStats />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
