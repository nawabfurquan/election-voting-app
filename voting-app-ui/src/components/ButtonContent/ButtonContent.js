import React from "react";
import { Link } from "react-router-dom";

const ButtonContent = () => {
  // Contains the Login and Signup Buttons
  return (
    <div className="container" style={{ marginTop: "30vh" }}>
      <div className="d-flex flex-column align-items-center">
        <Link
          to="/login"
          style={{
            textDecoration: "none",
            color: "white",
            width: "20%",
          }}
        >
          <button
            className="btn mb-3"
            style={{
              width: "100%",
              backgroundColor: "#1b222c",
              color: "white",
            }}
          >
            Login
          </button>
        </Link>
        <div className="mb-4" style={{ fontSize: "1.1rem" }}>
          or
        </div>
        <Link
          to="/signup"
          style={{
            textDecoration: "none",
            color: "white",
            width: "20%",
          }}
        >
          <button
            className="btn mb-3"
            style={{
              width: "100%",
              backgroundColor: "white",
              color: "#1b222c",
              border: "2px solid #1b222c",
            }}
          >
            Signup
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ButtonContent;
