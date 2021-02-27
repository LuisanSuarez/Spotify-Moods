const axios = require("axios");
const {
  spotifyUrl,
  spotifyPlaylists,
  spotifySavedTracks,
} = require("./variables");
axios.defaults.withCredentials = false;
const tokens = JSON.parse(localStorage.getItem("tokens"));

const spotifyService = () => {
  const fetchPlaylists = async () => {
    return fetch(spotifyPlaylists);
  };

  const fetchTracks = async url => {
    return await fetch(url);
  };

  const fetch = async url => {
    console.count("CORS error");
    let result;
    try {
      console.count("CORS error");
      const headers = {
        authorization: "Bearer " + tokens.access_token,
      };

      let playlists = [];
      let response;

      do {
        console.count("CORS error");
        response = await axios.get(url, { headers });
        console.count("CORS error");
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
};
module.exports = spotifyService();
