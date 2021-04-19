const axios = require("axios");
const { devUrl, prodUrl } = require("./variables");

export default function playlistsService() {
  const dbName = localStorage.getItem("dbName");
  const options = { params: { dbName } };
  const url = process.env.NODE_ENV === "development" ? devUrl : prodUrl;

  const getPlaylistsNames = async () => {
    const playlists = await axios.get(url + "api/getAllPlaylists", options);
    return Array.isArray(playlists.data) ? playlists.data : [];
  };

  const getPlaylistTrackIds = async id => {
    options.params.id = id;
    const playlist = await axios.get(url + "api/getPlaylist", options);
    delete options.params.id;

    return Array.isArray(playlist.data) ? playlist.data : [];
  };

  const getTags = async () => {
    const result = await axios.get(url + "api/getTags", options);
    return Array.isArray(result.data) ? result.data : [];
  };

  const getUntaggedSongs = async () => {
    const result = await axios.get(url + "api/getUntaggedSongs", options);
    return Array.isArray(result.data) ? result.data : [];
  };

  const addPlaylistToAllPlaylists = async playlist => {
    const { name, id } = playlist;
    const result = await axios.post(
      url + "api/addPlaylistToAllPlaylists",
      {
        name,
        id,
      },
      options
    );
  };

  const createOrUpdatePlaylistCollection = async (playlistId, tracks) => {
    const trackIds = tracks.map(track => {
      return { id: track.id };
    });
    const result = await axios.post(
      url + "api/createOrUpdatePlaylistCollection",
      {
        playlistId,
        trackIds,
      },
      options
    );
    return result;
  };

  return {
    getPlaylistsNames,
    getPlaylistTrackIds,
    getTags,
    getUntaggedSongs,
    addPlaylistToAllPlaylists,
    createOrUpdatePlaylistCollection,
  };
}

// module.exports = playlistsService();
// Vercel deploys fail if we export using modules
