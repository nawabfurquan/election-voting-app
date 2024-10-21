import React from "react";

const Header = ({ isAuthenticated, onLogout }) => {
  return (
    <header
      className="text-center mb-4 text-white p-4 position-relative"
      style={{ backgroundColor: "#1b222c" }}
    >
      <h2 className="h3">Shangri-La Election System</h2>
      {isAuthenticated && (
        <button
          type="button"
          className="btn position-absolute top-50 end-0 translate-middle-y me-4"
          onClick={onLogout}
          style={{
            backgroundColor: "white",
            color: "#1b222c",
            fontWeight: 500,
          }}
        >
          Logout
        </button>
      )}
    </header>
  );
};

export default Header;
