const axios = require("axios");
const {
  spotifyUrl,
  spotifyPlaylists,
  spotifySavedTracks,
} = require("./variables");
const authService = require("./authService");
axios.defaults.withCredentials = false;
let tokens =
  JSON.parse(localStorage.getItem("tokens")) ||
  authService
    .default()
    .getTokens()
    .then(res => (tokens = res));

export default function spotifyService() {
  const fetchPlaylists = async () => {
    return fetch(spotifyPlaylists);
  };

  const fetchTracks = async url => {
    return await fetch(url);
  };

  const fetch = async url => {
    let result;
    try {
      const headers = {
        authorization: "Bearer " + tokens.access_token,
      };

      let playlists = [];
      let response;

      do {
        response = await axios.get(url, { headers });
        playlists = [...playlists, ...response.data.items];
        url = response.data.next;
      } while (response.data.next);
      result = { data: playlists, error: false };
    } catch (err) {
      result = { error: true, msg: err.msg };
    } finally {
      return result;
    }
  };

  return {
    fetchPlaylists,
    fetchTracks,
  };
}
// module.exports = spotifyService();
// Vercel deploys fail if we export using modules
