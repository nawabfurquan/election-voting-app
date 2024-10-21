import React, { useState } from "react";
import { postSignup } from "../../utils/votingApi";
import { v4 as uuidv4 } from "uuid";
import { QrScanner } from "@yudiel/react-qr-scanner";

const Signup = ({
  setIsAuthenticated,
  setIsVoter,
  handleBack,
  setVoterDetails,
  navigate,
}) => {
  // State Variables
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    dateOfBirth: "",
    password: "",
    constituency: "",
    uvc: "",
  });
  const [errorMessage, setErrorMessage] = useState();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // To handle change in form data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // To handle submit button press
  const handleSubmit = (e) => {
    console.log("submit");
    e.preventDefault();

    // Calling signup api
    postSignup(formData).then((res) => {
      if (res?.error) {
        setErrorMessage(res?.errorMessage);
      } else if (res?.status === 0) {
        setErrorMessage(res?.message);
      } else {
        // Setting the state variables and storing items in localStorage
        setIsAuthenticated(true);
        setIsVoter(true);
        setVoterDetails(res?.voterDetails);
        localStorage.setItem("authToken", uuidv4());
        localStorage.setItem("isVoter", true);
        localStorage.setItem("voterDetails", JSON.stringify(res?.voterDetails));

        setFormData({
          email: "",
          fullName: "",
          dateOfBirth: "",
          password: "",
          constituency: "",
          uvc: "",
        });

        // Navigating to dashboard
        navigate("/");
      }
    });
  };

  return (
    <div className="container signup-screen">
      <h2 className="text-center mt-4 mb-4">Signup</h2>
      <div className="d-flex justify-content-end">
        <button
          onClick={() => setIsScannerOpen(true)}
          className="btn"
          style={{
            width: "9%",
            height: "100%",
            backgroundColor: "#1b222c",
            color: "white",
            alignSelf: "end",
          }}
        >
          Scan UVC Code
        </button>
      </div>
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
          <label>Full Name:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-group mb-3">
          <label>Date of Birth:</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
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
        <div className="form-group mb-3">
          <label>Constituency:</label>
          <input
            type="text"
            name="constituency"
            value={formData.constituency}
            placeholder="Enter Constituency name, Eg: shangri-la-town"
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-group mb-3">
          <label>Unique Voter Code (UVC):</label>
          {!isScannerOpen ? (
            <div
              className="form-group"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <input
                type="text"
                name="uvc"
                value={formData.uvc}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
              }}
            >
              <div style={{ width: "200px", height: "200px" }}>
                {/* QR code scanner */}
                <QrScanner
                  onDecode={(result) => {
                    console.log(result);
                    handleChange({ target: { name: "uvc", value: result } });
                    setIsScannerOpen(false);
                  }}
                  scanDelay={2000}
                  onError={(error) => console.log(error?.message)}
                />
              </div>
              <button
                className="btn"
                onClick={() => setIsScannerOpen(false)}
                style={{ backgroundColor: "#1b222c", color: "white" }}
              >
                Close
              </button>
            </div>
          )}
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
        <div className="form-group mb-4">
          <button
            type="submit"
            className="btn"
            onClick={handleSubmit}
            style={{ backgroundColor: "#1b222c", color: "white" }}
          >
            Register
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

export default Signup;
