import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import AdminDashboard from "./AdminDashboard";
import "./App.css";
import ClubEdit from "./ClubEdit.jsx";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/manage" element={<ClubEdit />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
