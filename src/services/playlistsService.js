const axios = require("axios");

const playlistsService = () => {
  const url =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8880/"
      : "http://localhost:8880/";

  const getPlaylistsNames = async () => {
    const playlists = await axios.get(url + "api/getAllPlaylists");
    return playlists.data[0] ? playlists.data : [];
  };

  const getPlaylistTrackIds = async id => {
    const playlist = await axios.get(url + "api/getPlaylist", {
      params: { id },
    });
    return playlist.data[0] ? playlist.data : [];
  };

  const getTags = async () => {
    const result = await axios.get(url + "api/getTags");
    return result.data ? result.data : [];
  };

  const getUntaggedSongs = async () => {
    const result = await axios.get(url + "api/getUntaggedSongs");
    return result.data ? result.data : [];
  };

  return { getPlaylistsNames, getPlaylistTrackIds, getTags, getUntaggedSongs };
};

module.exports = playlistsService();
