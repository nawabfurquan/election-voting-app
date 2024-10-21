import React, { useEffect, useState } from "react";
import {
  getConstituencyList,
  getVotingResults,
  getVotingStatus,
  postVotingStatus,
} from "../../utils/votingApi";

const OfficerDashboard = () => {
  const [electionStatus, setElectionStatus] = useState("");
  const [winner, setWinner] = useState(null);
  const [constituencyList, setConstituencyList] = useState([]);
  const [partyList, setPartyList] = useState([]);

  // Get the voting status
  useEffect(() => {
    getVotingStatus().then((res) => setElectionStatus(res?.status));
  }, []);

  // Getting constituency list and voting results if elections are over
  useEffect(() => {
    if (electionStatus === "Ongoing") {
      getConstituencyList()?.then((res) => setConstituencyList(res));
    }
    if (electionStatus === "Completed") {
      getVotingResults()?.then((res) => {
        setWinner(res?.winner);
        setPartyList(res?.seats);
      });
    }
  }, [electionStatus]);

  // Start election
  const handleStartElection = () => {
    postVotingStatus("Ongoing").then((res) => setElectionStatus("Ongoing"));
  };

  // End election
  const handleEndElection = () => {
    postVotingStatus("Completed").then((res) => setElectionStatus("Completed"));
  };

  return (
    <div className="container">
      <h2 className="text-center mt-4 mb-4">Election Commission Dashboard</h2>

      <div
        className="alert alert-secondary"
        role="alert"
        style={{ textAlign: "center" }}
      >
        Election Status: {electionStatus}
      </div>

      {electionStatus === "Pending" && (
        <button
          className="btn"
          onClick={handleStartElection}
          style={{ backgroundColor: "#1b222c", color: "white" }}
        >
          Start Election
        </button>
      )}

      {electionStatus === "Ongoing" && (
        <button
          className="btn"
          onClick={handleEndElection}
          style={{
            backgroundColor: "white",
            color: "#1b222c",
            border: "2px solid #1b222c",
          }}
        >
          End Election
        </button>
      )}

      {electionStatus === "Ongoing" && (
        <>
          <h4 className="mt-4">Votings:</h4>
          {constituencyList.map((constituency, index) => (
            <div key={index}>
              <h4 className="mt-4">{constituency.constituency}:</h4>
              <ul className="list-group mb-4">
                {constituency.constituencyList.map((candidate, idx) => (
                  <li key={idx} className="list-group-item">
                    {candidate.name} - {candidate.party} - Votes:{" "}
                    {candidate.vote}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}

      {electionStatus === "Completed" && (
        <div>
          <h4 className="mt-4">Election Results:</h4>
          <ul className="list-group">
            {partyList.map((party, index) => (
              <li key={index} className="list-group-item">
                {party?.party}: {party?.seats} seats
              </li>
            ))}
          </ul>
          <h4 className="mt-4">
            Winner:{" "}
            <span style={{ textDecoration: "underline" }}>{winner}</span>
          </h4>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;
