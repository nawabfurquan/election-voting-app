import React, { useEffect, useState } from "react";
import {
  getCandidates,
  getCheckVote,
  getVotingResults,
  getVotingStatus,
  postVote,
} from "../../utils/votingApi";

const VoterDashboard = ({ voterDetails }) => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [votingStatus, setVotingStatus] = useState("Ongoing");
  const [candidateList, setCandidateList] = useState([]);
  const [winner, setWinner] = useState(null);
  const [partyList, setPartyList] = useState([]);

  // Calling voting status and check vote apis
  useEffect(() => {
    getVotingStatus().then((res) => setVotingStatus(res?.status));
  }, []);

  useEffect(() => {
    if (votingStatus === "Ongoing") {
      getCheckVote(voterDetails?.email)?.then((res) => {
        if (!res?.err) {
          setVoteSubmitted(res?.voted);
        }
      });
    }

    if (votingStatus === "Completed") {
      getVotingResults()?.then((res) => {
        setWinner(res?.winner);
        setPartyList(res?.seats);
      });
    }
  }, [votingStatus]);

  // Calling candidate list api to get candidate data
  useEffect(() => {
    if (!voteSubmitted) {
      getCandidates(voterDetails?.constituencyId)?.then((res) => {
        setCandidateList(res?.candidateList);
      });
    }
  }, [voteSubmitted]);

  // To handle vote call
  const handleVote = (candidateId) => {
    setSelectedCandidate(candidateId);
    postVote({
      voter_id: voterDetails?.email,
      candidate_id: candidateId,
    }).then((res) => {
      setVoteSubmitted(true);
    });
  };

  return (
    <div className="container">
      <h2 className="text-center mt-4 mb-4">Voter Dashboard</h2>
      <div>
        {votingStatus === "Pending" && (
          <div className="text-center mt-4">
            <div
              className="alert alert-secondary"
              style={{ marginTop: "10vh", fontWeight: 500 }}
            >
              Voting Status: Not Started
            </div>
          </div>
        )}

        {votingStatus === "Ongoing" &&
          (voteSubmitted ? (
            <>
              <div
                className="alert alert-secondary text-center"
                role="alert"
                style={{ fontWeight: 500 }}
              >
                Vote Submitted Successfully!
              </div>
            </>
          ) : (
            <>
              <p>Select a candidate to cast your vote:</p>
              <div className="list-group">
                {candidateList.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    className={`list-group-item list-group-item-action`}
                    onClick={() => handleVote(candidate.id)}
                    disabled={selectedCandidate !== null}
                  >
                    {candidate.name} - {candidate.party}
                  </button>
                ))}
              </div>
            </>
          ))}

        {votingStatus === "Completed" && (
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
    </div>
  );
};

export default VoterDashboard;
