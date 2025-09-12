import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import AdminDashboard from "./AdminDashboard";
import "./App.css";
import ClubEdit from "./ClubEdit.jsx";
import Setup from "./Setup";
import CompetitionStats from "./CompetitionStats";
import CompetitionEdit from "./CompetitionEdit"; // Add this import
import CreateFixture from "./CreateFixture";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/manage" element={<ClubEdit />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/competition/:id" element={<CompetitionStats />} />
          <Route path="/edit-competition/:id" element={<CompetitionEdit />} /> {/* Add this route */}
          <Route path="/create-fixture/:id" element={<CreateFixture />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;