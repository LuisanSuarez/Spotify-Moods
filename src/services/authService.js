const axios = require("axios");
const { devUrl, prodUrl, spotifyUrl } = require("./variables");

export default function authService() {
  const url = process.env.NODE_ENV === "development" ? devUrl : prodUrl;

  const setTokens = () => {
    "setTokens";
  };

  const getTokens = async () =>
    await axios.get(url + "auth/tokens").then(res => res.data);

  const getUser = async () => {
    const userData = await axios.get(spotifyUrl, { headers: getHeaders() });
    return userData.data;
  };

  const getHeaders = () => {
    let headers = JSON.parse(localStorage.getItem("headers"));
    if (headers) return headers;
    let tokens = JSON.parse(localStorage.getItem("tokens")) || getTokens();
    headers = { authorization: "Bearer " + tokens.access_token };

    return headers;
  };

  return { setTokens, getTokens, getUser, getHeaders };
}

// module.exports = authService();
// Vercel deploys fail if we export using modules
