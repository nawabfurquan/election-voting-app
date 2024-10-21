import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import Header from "./components/Header/Header";
import Login from "./components/Login/Login";
import OfficerDashboard from "./components/OfficerDashboard/OfficerDashboard";
import Signup from "./components/Signup/Signup";
import VoterDashboard from "./components/VoterDashboard/VoterDashboard";
import ButtonContent from "./components/ButtonContent/ButtonContent";

function App() {
  const navigate = useNavigate();
  // State variables
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVoter, setIsVoter] = useState(false);
  const [voterDetails, setVoterDetails] = useState();

  // useEffect to get the items from localStorage
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const tempVoterDetails = localStorage.getItem("voterDetails");
    const tempIsVoter = localStorage.getItem("isVoter");
    if (authToken) {
      setIsAuthenticated(true);
    }
    if (tempIsVoter) {
      setIsVoter(tempIsVoter);
    }
    if (tempVoterDetails) {
      setVoterDetails(
        tempVoterDetails ? JSON.parse(tempVoterDetails) : undefined
      );
    }
  }, []);

  // Defining Routes for each action
  return (
    <>
      <Header
        isAuthenticated={isAuthenticated}
        // Clearing states and localStorage
        onLogout={() => {
          localStorage.removeItem("authToken");
          localStorage.removeItem("voterDetails");
          localStorage.removeItem("isVoter");
          setIsAuthenticated(false);
          setIsVoter(false);
          setVoterDetails(null);
          navigate("/");
        }}
      />
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              setIsAuthenticated={setIsAuthenticated}
              setIsVoter={setIsVoter}
              setVoterDetails={setVoterDetails}
              handleBack={() => navigate("/")}
              navigate={navigate}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <Signup
              setIsAuthenticated={setIsAuthenticated}
              setIsVoter={setIsVoter}
              setVoterDetails={setVoterDetails}
              handleBack={() => navigate("/")}
              navigate={navigate}
            />
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              isVoter ? (
                <VoterDashboard voterDetails={voterDetails} />
              ) : (
                <OfficerDashboard />
              )
            ) : (
              <ButtonContent />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
