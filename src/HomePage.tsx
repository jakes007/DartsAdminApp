import { Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="homepage-container">
      <header className="app-header">
        <h1>OBSERVATORY DARTS ASSOCIATION</h1>
      </header>

      <main className="main-content">
        <div className="portal-grid">
          <Link to="/admin" className="portal-tile">
            <h2>Admin Portal</h2>
            <p>
              League administrators oversee competitions and verify results.
            </p>
          </Link>

          <div className="portal-tile">
            <h2>Club Portal</h2>
            <p>
              Registered clubs can manage their teams and submit match data.
            </p>
          </div>

          <div className="portal-tile">
            <h2>Guest View</h2>
            <p>
              Browse leagues, tournaments, and player stats. No login required.
            </p>
          </div>
        </div>

        <p className="app-description">
          Manage your league in the future, today.
        </p>
      </main>
    </div>
  );
};

export default HomePage;
