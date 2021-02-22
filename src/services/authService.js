const axios = require("axios");

const authService = () => {
  const url =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8880/"
      : "http://localhost:8880/";

  const setTokens = () => {
    "setTokens";
  };

  const getTokens = async () =>
    await axios.get(url + "auth/tokens").then(res => res.data);

  const getHeaders = () => {
    let headers = JSON.parse(localStorage.getItem("headers"));
    if (headers) return headers;
    let tokens = JSON.parse(localStorage.getItem("tokens")) || getTokens();
    headers = { authorization: "Bearer " + tokens.access_token };
    console.log({ headers });
    return headers;
  };

  return { setTokens, getTokens, getHeaders };
};

module.exports = authService();
