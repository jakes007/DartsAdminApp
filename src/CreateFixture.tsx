import { useNavigate, useParams } from "react-router-dom";
import "./CreateFixture.css"; // We'll create this CSS file next

const CreateFixture = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get competition ID from URL

  const handleBackToSetup = () => {
    navigate("/setup");
  };

  return (
    <div className="fixture-container">
      <header className="fixture-header">
        <div className="header-left">
          <button className="back-btn" onClick={handleBackToSetup}>
            <span className="back-text">Back to Setup</span>
            <span className="back-arrow">←</span>
          </button>
        </div>

        <h1>Create Fixtures</h1>

        <div className="header-right">
          {/* Empty for balance */}
        </div>
      </header>

      <main className="fixture-main">
        <div className="fixture-content">
          <h2>Fixtures for Competition #{id}</h2>
          <p>Fixture creation functionality will be implemented here.</p>
          {/* We'll add the fixture creation UI here in future updates */}
        </div>
      </main>
    </div>
  );
};

export default CreateFixture;