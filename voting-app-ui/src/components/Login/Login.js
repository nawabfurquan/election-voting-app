import React, { useState } from "react";
import { postLogin } from "../../utils/votingApi";
import { v4 as uuidv4 } from "uuid";

const Login = ({
  setIsAuthenticated,
  setIsVoter,
  handleBack,
  setVoterDetails,
  navigate,
}) => {
  // State variables
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState();

  // To handle change in form data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // To handle submit button press
  const handleSubmit = async (e) => {
    e.preventDefault();
    postLogin(formData).then((res) => {
      if (res?.error) {
        setErrorMessage(res?.errorMessage);
      } else if (res?.status === 0) {
        setErrorMessage(res?.message);
      } else {
        // Setting state variables and storing items in localStorage
        setIsAuthenticated(true);
        setIsVoter(res?.isVoter);
        if (res?.voterDetails) {
          setVoterDetails(res?.voterDetails);
          localStorage.setItem(
            "voterDetails",
            JSON.stringify(res?.voterDetails)
          );
        }
        localStorage.setItem("authToken", uuidv4());
        if (res?.isVoter) {
          localStorage.setItem("isVoter", res?.isVoter);
        }
        // Reset the form data

        setFormData({
          email: "",
          password: "",
        });

        // Navigating to dashboard
        navigate("/");
      }
    });
  };
  return (
    <div className="container login-screen">
      <h2 className="text-center mt-4 mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-group mb-3">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        {errorMessage ? (
          <div
            className="alert alert-danger mb-4 p-2"
            style={{ textAlign: "center", fontWeight: 500 }}
          >
            {errorMessage}
          </div>
        ) : (
          <></>
        )}
        <div className="form-group mt-4">
          <button
            type="submit"
            className="btn"
            style={{ backgroundColor: "#1b222c", color: "white" }}
          >
            Login
          </button>
          <button
            type="button"
            className="btn ms-3"
            onClick={handleBack}
            style={{
              backgroundColor: "white",
              color: "#1b222c",
              border: "2px solid #1b222c",
            }}
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
