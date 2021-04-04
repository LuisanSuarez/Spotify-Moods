const axios = require("axios");
const {
  spotifyUrl,
  spotifyPlaylists,
  spotifySavedTracks,
} = require("./variables");
axios.defaults.withCredentials = false;
const tokens = JSON.parse(localStorage.getItem("tokens"));

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
//// module.exports = spotifyService();
