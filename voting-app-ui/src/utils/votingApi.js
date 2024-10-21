import axios from "axios";

const API_URL = "http://localhost:5000";

export const postLogin = async (formData) => {
  return await axios
    .post(`${API_URL}/gevs/login`, formData)
    .then((res) => {
      if (res?.status !== 200) {
        return {
          error: true,
          errorMessage: "Error occured with status: " + res?.status,
        };
      }
      return res?.data;
    })
    .catch((err) => {
      return { error: true, errorMessage: err?.response?.data?.message };
    });
};

export const postSignup = async (formData) => {
  return await axios
    .post(`${API_URL}/gevs/signup`, formData)
    .then((res) => {
      if (res?.status !== 200) {
        return {
          error: true,
          errorMessage: "Error occured with status: " + res?.status,
        };
      }
      return res?.data;
    })
    .catch((err) => {
      return { error: true, errorMessage: err?.response?.data?.message };
    });
};

export const getVotingStatus = async () => {
  return axios
    .get(`${API_URL}/gevs/election-status`)
    .then((res) => {
      if (res?.status !== 200) {
        return {
          error: true,
          errorMessage: "Error occured with status: " + res?.status,
        };
      }
      return res?.data;
    })
    .catch((err) => {
      return { error: true, errorMessage: err };
    });
};

export const postVotingStatus = async (status) => {
  return axios
    .post(`${API_URL}/gevs/election-status`, { status: status })
    .then((res) => {
      if (res?.status !== 200) {
        return {
          error: true,
          errorMessage: "Error occured with status: " + res?.status,
        };
      }
      return res?.data;
    })
    .catch((err) => {
      return { error: true, errorMessage: err };
    });
};

export const getConstituencyList = async () => {
  return axios
    .get(`${API_URL}/gevs/constituency-list`)
    .then((res) => {
      if (res?.status !== 200) {
        return {
          error: true,
          errorMessage: "Error occured with status: " + res?.status,
        };
      }
      return res?.data;
    })
    .catch((err) => {
      return { error: true, errorMessage: err };
    });
};

export const getVotingResults = async () => {
  return axios
    .get(`${API_URL}/gevs/results`)
    .then((res) => {
      if (res?.status !== 200) {
        return {
          error: true,
          errorMessage: "Error occured with status: " + res?.status,
        };
      }
      return res?.data;
    })
    .catch((err) => {
      return { error: true, errorMessage: err };
    });
};

export const postVote = async (requestBody) => {
  return axios
    .post(`${API_URL}/gevs/vote`, requestBody)
    .then((res) => {
      if (res?.status !== 200) {
        return {
          error: true,
          errorMessage: "Error occured with status: " + res?.status,
        };
      }
      return res?.data;
    })
    .catch((err) => {
      return { error: true, errorMessage: err };
    });
};

export const getCandidates = async (constituencyId) => {
  return axios
    .get(`${API_URL}/gevs/candidate-list/${constituencyId}`)
    .then((res) => {
      if (res?.status !== 200) {
        return {
          error: true,
          errorMessage: "Error occured with status: " + res?.status,
        };
      }
      return res?.data;
    })
    .catch((err) => {
      return { error: true, errorMessage: err };
    });
};

export const getCheckVote = async (voterId) => {
  return axios
    .get(`${API_URL}/gevs/check-vote/${voterId}`)
    .then((res) => {
      if (res?.status !== 200) {
        return {
          error: true,
          errorMessage: "Error occured with status: " + res?.status,
        };
      }
      return res?.data;
    })
    .catch((err) => {
      return { error: true, errorMessage: err };
    });
};
