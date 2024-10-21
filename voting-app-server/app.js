require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const swaggerUi = require("swagger-ui-express");
const swaggerConfig = require("./swaggerConfig");

const app = express();

// Initializing app setup using express
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// No of rounds for bcrypt
const rounds = 10;

const officerEmail = process.env.EMAIL;
let officerPassword = process.env.PASSWORD;

const encryptPassword = async () => {
  officerPassword = await bcrypt.hash(atob(officerPassword), rounds);
};

// Database operations to create tables and insert data into tables
const db = new sqlite3.Database(":memory:");
db.serialize(async () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS constituency (
      constituency_id INTEGER PRIMARY KEY AUTOINCREMENT,
      constituency_name VARCHAR(50)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS party (
      party_id INTEGER PRIMARY KEY AUTOINCREMENT,
      party_name VARCHAR(50)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS voter (
      voter_id VARCHAR(50) PRIMARY KEY,
      full_name VARCHAR(50),
      dob DATE,
      password LONGTEXT,
      uvc VARCHAR(50) UNIQUE,
      constituency_id INTEGER,
      FOREIGN KEY (constituency_id) REFERENCES constituency(constituency_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS uvc_code (
      uvc_id VARCHAR(50) PRIMARY KEY,
      used INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS candidate (
      candidate_id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_name VARCHAR(50),
      vote_count INTEGER,
      party_id INTEGER,
      constituency_id INTEGER,
      FOREIGN KEY (party_id) REFERENCES party(party_id),
      FOREIGN KEY (constituency_id) REFERENCES constituency(constituency_id)
    )
  `);

  db.run(`
      CREATE TABLE IF NOT EXISTS officer (
        officer_id VARCHAR(50) PRIMARY KEY,
        password LONGTEXT
      )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS election_status (
      status_id INTEGER PRIMARY KEY,
      status VARCHAR(50)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS election_result (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      voter_id INTEGER,
      candidate_id INTEGER,
      FOREIGN KEY (voter_id) REFERENCES voter(voter_id),
      FOREIGN KEY (candidate_id) REFERENCES candidate(candidate_id)
    )
  `);

  await encryptPassword();

  db.run("INSERT INTO officer (officer_id, password) VALUES (?, ?)", [
    atob(officerEmail),
    officerPassword,
  ]);

  db.run(
    'INSERT INTO constituency VALUES (1,"shangri-la-town"),(2,"northern-kunlun-mountain"),(3,"western-shangri-la"),(4,"naboo-vallery"),(5,"new-felucia")'
  );

  db.run(
    'INSERT INTO uvc_code VALUES ("HH64FWPE",0),("BBMNS9ZJ",0),("KYMK9PUH",0),("WL3K3YPT",0),("JA9WCMAS",0),("Z93G7PN9",0),("WPC5GEHA",0),("RXLNLTA6",0),("7XUFD78Y",0),("DBP4GQBQ",0)'
  );
  db.run(
    'INSERT INTO uvc_code VALUES ("ZSRBTK9S",0),("B7DMPWCQ",0),("YADA47RL",0),("9GTZQNKB",0),("KSM9NB5L",0),("BQCRWTSG",0),("ML5NSKKG",0),("D5BG6FDH",0),("2LJFM6PM",0),("38NWLPY3",0)'
  );
  db.run(
    'INSERT INTO uvc_code VALUES ("2TEHRTHJ",0),("G994LD9T",0),("Q452KVQE",0),("75NKUXAH",0),("DHKVCU8T",0),("TH9A6HUB",0),("2E5BHT5R",0),("556JTA32",0),("LUFKZAHW",0),("DBAD57ZR",0)'
  );
  db.run(
    'INSERT INTO uvc_code VALUES ("K96JNSXY",0),("PFXB8QXM",0),("8TEXF2HD",0),("N6HBFD2X",0),("K3EVS3NM",0),("5492AC6V",0),("U5LGC65X",0),("BKMKJN5S",0),("JF2QD3UF",0),("NW9ETHS7",0)'
  );
  db.run(
    'INSERT INTO uvc_code VALUES ("VFBH8W6W",0),("7983XU4M",0),("2GYDT5D3",0),("LVTFN8G5",0),("UNP4A5T7",0),("UMT3RLVS",0),("TZZZCJV8",0),("UVE5M7FR",0),("W44QP7XJ",0),("9FCV9RMT",0)'
  );

  db.run(
    'INSERT INTO party VALUES (1,"Blue Party"),(2,"Red Party"),(3,"Yellow Party"),(4,"Independent")'
  );

  db.run(
    `INSERT INTO candidate (candidate_name, vote_count, party_id, constituency_id) VALUES 
    ("Candidate 1",0,1,1),
    ("Candidate 2",3,2,1),
    ("Candidate 3",2,3,1),
    ("Candidate 4",0,4,1),
    ("Candidate 5",3,1,2),
    ("Candidate 6",2,2,2),
    ("Candidate 7",0,3,2),
    ("Candidate 8",0,4,2),
    ("Candidate 9",0,1,3),
    ("Candidate 10",0,2,3),
    ("Candidate 11",3,3,3),
    ("Candidate 12",2,4,3),
    ("Candidate 13",0,1,4),
    ("Candidate 14",2,2,4),
    ("Candidate 15",3,3,4),
    ("Candidate 16",0,4,4),
    ("Candidate 17",0,1,5),
    ("Candidate 18",0,2,5),
    ("Candidate 19",3,3,5),
    ("Candidate 20",0,4,5)`
  );

  db.run('INSERT INTO election_status (status) VALUES ("Pending")');
});

// Signup API
app.post("/gevs/signup", async (req, res) => {
  try {
    const { email, fullName, dateOfBirth, password, constituency, uvc } =
      req.body;

    const hashedVoterPassword = await bcrypt.hash(password, rounds);

    // Check if email already exists
    await new Promise((resolve, reject) => {
      db.get(
        "SELECT voter_id FROM voter WHERE voter_id=?",
        [email],
        (err, row) => {
          if (err) {
            reject(err);
          }
          if (row) {
            return res.status(200).json({
              message:
                "The provided email is already linked to another registered voter",
              status: 0,
            });
          }
          resolve();
        }
      );
    });

    // Getting constituency id
    const constRow = await new Promise((resolve, reject) => {
      db.get(
        "SELECT constituency_id FROM constituency WHERE constituency_name=?",
        [constituency?.toLowerCase()],
        (constErr, constRow) => {
          if (constErr) {
            reject(constErr);
          } else {
            if (constRow) {
              resolve(constRow);
            } else {
              reject();
            }
          }
        }
      );
    });

    // Getting uvc codes
    const uvcCodes = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM uvc_code", (uvcErr, uvcRows) => {
        if (uvcErr) {
          reject(uvcErr);
        } else {
          resolve(uvcRows);
        }
      });
    });

    let isUvcNotExist = true;

    // Checking if uvc code is valid
    for (const uvcCode of uvcCodes) {
      if (uvcCode?.uvc_id === uvc) {
        isUvcNotExist = false;
        if (uvcCode?.used) {
          return res.status(200).json({
            message:
              "Another user has already used the given UVC or has already scanned the QR code",
            status: 0,
          });
        } else {
          await new Promise((resolve, reject) => {
            db.run(
              "UPDATE uvc_code SET used=1 WHERE uvc_id=?",
              [uvc],
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              }
            );
          });
        }
      }
    }

    // If uvc code doesnot exist in database
    if (isUvcNotExist) {
      return res.status(200).json({
        message: "UVC code does not match the record in the database",
        status: 0,
      });
    }

    // Inserting new voter data into db
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO voter (voter_id, full_name, dob, password, constituency_id, uvc) VALUES (?, ?, ?, ?, ?, ?)",
        [
          email,
          fullName,
          dateOfBirth,
          hashedVoterPassword,
          constRow.constituency_id,
          uvc,
        ],
        (err) => {
          if (err) {
            reject(err);
          } else {
            res.status(200).json({
              message: "Registration successful",
              voterDetails: {
                email: email,
                fullName: fullName,
                dateOfBirth: dateOfBirth,
                constituencyId: constRow?.constituency_id,
                uvc: uvc,
              },
            });
            resolve();
          }
        }
      );
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Login API
app.post("/gevs/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let isVoter = true;

    // Getting officer data
    const officerRow = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM officer", (officerErr, officerRow) => {
        if (officerErr) {
          reject(officerErr);
        } else {
          resolve(officerRow);
        }
      });
    });

    // Checking if the email belongs to officer
    if (officerRow && officerRow.officer_id === email) {
      isVoter = false;
    }

    // Getting the user data
    const row = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM ${isVoter ? "voter" : "officer"} WHERE ${
          isVoter ? "voter_id" : "officer_id"
        } = ?`,
        [email],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });

    if (!row) {
      return res
        .status(401)
        .json({ message: "Invalid email or password", status: 0 });
    }

    const storedHashedPassword = row.password;

    // Comparing the provided password with the stored password
    const passwordMatch = await bcrypt.compare(password, storedHashedPassword);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "Invalid email or password", status: 0 });
    }

    // Password is correct, user is authenticated
    res.status(200).json({
      message: "Login successful",
      status: 1,
      isVoter: isVoter,
      voterDetails: isVoter
        ? {
            email: row?.voter_id,
            fullName: row?.full_name,
            dateOfBirth: row?.dob,
            constituencyId: row?.constituency_id,
            uvc: row?.uvc,
          }
        : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", status: 0 });
  }
});

// Election Status API
app.get("/gevs/election-status", (req, res) => {
  // Retrieve the election status from the database
  db.get("SELECT status FROM election_status", (err, row) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.status(200).json({ status: row.status });
  });
});

// Election Status POST API
app.post("/gevs/election-status", (req, res) => {
  const { status } = req.body;
  // Updating the election status in db
  db.run("UPDATE election_status SET status=?", [status], (err) => {
    if (err) {
      return res.status(400).json({
        message: "Election Status updation failed",
      });
    }
    res.status(200).json({ message: "Election Status changed successfully" });
  });
});

/**
 * @swagger
 * paths:
 *   /gevs/constituency/{constituency}:
 *     get:
 *       summary: Constituency API
 *       description: Obtain the electoral district's vote count.
 *       parameters:
 *         - in: path
 *           name: constituency
 *           required: true
 *           description: Name of the constituency.
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Successful response
 *           content:
 *             application/json:
 *               example:
 *                 constituency: "northern-kunlun-mountain"
 *                 result:
 *                   - name: "candidate 1"
 *                     party: "Red Party"
 *                     vote: "4"
 *                   - name: "candidate 2"
 *                     party: "Blue Party"
 *                     vote: "2"
 *                   - name: "candidate 3"
 *                     party: "Yellow Party"
 *                     vote: "1"
 *         404:
 *           description: Constituency not found
 *           content:
 *             application/json:
 *               example:
 *                 message: "Constituency not found"
 *                 status: 0
 *         500:
 *           description: Internal server error
 *           content:
 *             application/json:
 *               example:
 *                 message: "Internal Server Error"
 *                 status: 0
 */
app.get("/gevs/constituency/:constituency", async (req, res) => {
  try {
    const constituency_name = req.params.constituency?.toLowerCase();
    const constituency_list = [];

    // Getting constituency data
    const constRow = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM constituency WHERE constituency_name=?",
        [constituency_name],
        (constErr, constRow) => {
          if (constErr) {
            reject({ message: "Internal Server Error" });
          } else {
            resolve(constRow);
          }
        }
      );
    });

    // Getting candidates for each constituency
    const canRows = await new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM candidate WHERE constituency_id=?",
        [constRow?.constituency_id],
        (canErr, canRows) => {
          if (canErr) {
            reject({ message: "Internal Server Error" });
          } else {
            resolve(canRows);
          }
        }
      );
    });

    // Getting party of each candidate
    for (const canRow of canRows) {
      const row = await new Promise((resolve, reject) => {
        db.get(
          "SELECT party_name FROM party WHERE party_id=?",
          [canRow?.party_id],
          (err, row) => {
            if (err) {
              reject({ message: "Internal Server Error" });
            } else {
              resolve(row);
            }
          }
        );
      });

      constituency_list.push({
        name: canRow?.candidate_name,
        party: row?.party_name,
        vote: canRow?.vote_count,
      });
    }

    // Formatting the response
    const response = {
      constituency: constituency_name,
      result: constituency_list,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Check Vote API
app.get("/gevs/check-vote/:voter_id", async (req, res) => {
  try {
    const voter_id = req.params.voter_id;
    // Getting voting information of voter
    const voteRow = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM election_result WHERE voter_id=?",
        [voter_id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
    if (voteRow) {
      const candidateRow = await new Promise((resolve, reject) => {
        db.get(
          "SELECT candidate_name FROM candidate WHERE candidate_id=?",
          [voteRow?.candidate_id],
          (err, row) => {
            if (err) {
              reject(err);
            } else {
              resolve(row);
            }
          }
        );
      });
      return res
        .status(200)
        .json({ voted: true, candidate: candidateRow?.candidate_name });
    }
    res.status(200).json({ voted: false });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Candidate List API
app.get("/gevs/candidate-list/:constituency", async (req, res) => {
  try {
    const constituencyId = req.params.constituency;
    const candidate_list = [];

    // Getting candidates for constituency from db
    const candidateRows = await new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM candidate WHERE constituency_id=?",
        [constituencyId],
        (canErr, canRows) => {
          if (canErr) {
            reject({ message: "Internal Server Error" });
          } else {
            resolve(canRows);
          }
        }
      );
    });

    // Getting party of each candidate from db
    for (const candidate of candidateRows) {
      const partyRow = await new Promise((resolve, reject) => {
        db.get(
          "SELECT party_name FROM party WHERE party_id=?",
          [candidate?.party_id],
          (partyErr, partyRow) => {
            if (partyErr) {
              reject({ message: "Internal Server Error" });
            } else {
              resolve(partyRow);
            }
          }
        );
      });

      candidate_list.push({
        id: candidate?.candidate_id,
        name: candidate?.candidate_name,
        party: partyRow?.party_name,
      });
    }
    // Returning the candidate list
    res.status(200).json({ candidateList: candidate_list });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Vote POST API
app.post("/gevs/vote", (req, res) => {
  const { voter_id, candidate_id } = req.body;
  // Getting voting information of voter
  db.get(
    "SELECT * FROM election_result WHERE voter_id=?",
    [voter_id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: "Internal Server Error" });
      }
      // If not voted, inserting new row into election_result
      if (!row) {
        db.run(
          "INSERT INTO election_result (voter_id, candidate_id) VALUES (?,?)",
          [voter_id, candidate_id],
          (electionErr) => {
            if (electionErr) {
              return res.status(500).json({ message: "Internal Server Error" });
            }

            // Updating the vote count of the candidate
            db.get(
              "SELECT candidate_id, vote_count FROM candidate WHERE candidate_id=?",
              [candidate_id],
              (canErr, canRow) => {
                if (canErr) {
                  return res
                    .status(500)
                    .json({ message: "Internal Server Error" });
                }
                db.run(
                  "UPDATE candidate SET vote_count=? WHERE candidate_id=?",
                  [canRow?.vote_count + 1, canRow?.candidate_id],
                  (updateErr) => {
                    if (updateErr) {
                      return res
                        .status(500)
                        .json({ message: "Internal Server Error" });
                    }
                    res
                      .status(200)
                      .json({ message: "Vote Added successfully" });
                  }
                );
              }
            );
          }
        );
      } else {
        // If vote already exists
        res.status(200).json({ message: "Vote Already Exists" });
      }
    }
  );
});

/**
 * @swagger
 * paths:
 *   /gevs/results:
 *     get:
 *       summary: Results API
 *       description: Return the election result by listing all MP seats won across all electoral districts for every political party.
 *       responses:
 *         200:
 *           description: Successful response
 *           content:
 *             application/json:
 *               example:
 *                 status: "Completed"
 *                 winner: "Red Party"
 *                 seats:
 *                   - party: "Red Party"
 *                     seat: "3"
 *                   - party: "Blue Party"
 *                     seat: "1"
 *                   - party: "Yellow Party"
 *                     seat: "1"
 *                   - party: "Independent"
 *                     seat: "0"
 *         500:
 *           description: Internal server error
 *           content:
 *             application/json:
 *               example:
 *                 message: "Internal Server Error"
 */
app.get("/gevs/results", async (req, res) => {
  try {
    // getting election status from db
    const statusRow = await new Promise((resolve, reject) => {
      db.get("SELECT status FROM election_status", (statusErr, statusRow) => {
        if (statusErr) {
          reject(statusErr);
        } else {
          resolve(statusRow);
        }
      });
    });

    // Checking the status
    if (statusRow?.status === "Ongoing" || statusRow?.status === "Pending") {
      return res
        .status(200)
        .json({ status: "Pending", winner: "Pending", seats: [] });
    }

    // Getting party list from db
    const partyList = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM party", (partyErr, partyRows) => {
        if (partyErr) {
          reject(partyErr);
        } else {
          resolve(partyRows);
        }
      });
    });

    // Adding seats field to each party object
    partyList?.forEach((party) => (party["seats"] = 0));

    // Getting constituency list from db
    const constituencyList = await new Promise((resolve, reject) => {
      db.all("SELECT * from constituency", (constErr, constRows) => {
        if (constErr) {
          reject(constErr);
        } else {
          resolve(constRows);
        }
      });
    });

    let totalSeats = 0;
    const results = {
      status: "Completed",
      winner: "Hung Parliament",
      seats: [],
    };

    // Getting candidates for each constituency
    for (const constituency of constituencyList) {
      const candidateRows = await new Promise((resolve, reject) => {
        db.all(
          "SELECT * FROM candidate WHERE constituency_id=?",
          [constituency?.constituency_id],
          (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          }
        );
      });

      let maxVote = -1;
      let maxVoteCandidate;

      // Calculating the max vote candidate
      for (const candidate of candidateRows) {
        if (maxVote < candidate?.vote_count) {
          maxVote = candidate?.vote_count;
          maxVoteCandidate = candidate;
        }
      }

      // Updating the seat of max vote candidate's party
      for (const party of partyList) {
        if (party?.party_id === maxVoteCandidate?.party_id) {
          party["seats"] = party?.seats + 1;
          totalSeats += 1;
        }
      }
    }

    // Checking if the party has majority of seats
    for (const party of partyList) {
      if (totalSeats > 0) {
        if (party?.seats > totalSeats / 2) {
          results.winner = party?.party_name;
        }
      }
      results.seats.push({
        party: party?.party_name,
        seats: `${party?.seats}`,
      });
    }

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Constituency List API
app.get("/gevs/constituency-list", async (req, res) => {
  try {
    const response = [];
    // Getting constituencies from db
    const constRows = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM constituency", (constErr, constRows) => {
        if (constErr) {
          reject({ message: "Internal Server Error" });
        } else {
          resolve(constRows);
        }
      });
    });

    // Getting candidates for each constituency
    for (const row of constRows) {
      const canRow = await new Promise((resolve, reject) => {
        db.get(
          "SELECT * FROM candidate WHERE constituency_id=?",
          [row?.constituency_id],
          (canErr, canRow) => {
            if (canErr) {
              reject({ message: "Internal Server Error" });
            } else {
              resolve(canRow);
            }
          }
        );
      });

      // Getting party name for each candidate
      const result = [];
      const partyRow = await new Promise((resolve, reject) => {
        db.get(
          "SELECT party_name FROM party WHERE party_id=?",
          [canRow?.party_id],
          (partErr, partyRow) => {
            if (partErr) {
              reject({ message: "Internal Server Error" });
            } else {
              resolve(partyRow);
            }
          }
        );
      });

      result.push({
        name: canRow?.candidate_name,
        party: partyRow?.party_name,
        vote: canRow?.vote_count,
      });

      response.push({
        constituency: row?.constituency_name,
        constituencyList: result,
      });
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Swagger Doc
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerConfig));

app.listen(5000, () => {
  console.log("Server Running on port 5000");
});
