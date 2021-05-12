const axios = require("axios");
const { devUrl, prodUrl } = require("./variables");

export default function tracksService() {
  const dbName = localStorage.getItem("dbName");
  const options = { params: { dbName } };
  const url = process.env.NODE_ENV === "development" ? devUrl : prodUrl;

  const sanitizeTracksArray = rawTracks => {
    return rawTracks.map(trackData => {
      const track = trackData.track;
      const trackObj = {
        albumName: "",
        albumImages: [],
        artists: [],
        name: "",
        uri: "",
        id: "",
      };
      trackObj.albumName = track.album.name;
      trackObj.albumImages = track.album.images;
      trackObj.image = track.album.images[track.album.images.length - 1].url;
      trackObj.artists = track.artists;
      trackObj.name = track.name;
      trackObj.uri = track.uri;
      trackObj.id = track.id;

      return trackObj;
    });
  };

  const addImagePropertyToLegacyTracks = tracksArray => {
    const newTracksArray = [...tracksArray];
    newTracksArray.forEach(track => {
      if (!track.image)
        track.image = track.albumImages[track.albumImages.length - 1].url;
    });
    return newTracksArray;
  };

  const getTracksBulk = async playlistsArray => {
    const tracks = [];
    const playlists = [...playlistsArray];

    while (playlists.length) {
      options.params.playlists = playlists.splice(0, 100);
      const result = await axios.get(url + "api/getTracksBulk", options);
      result.data.forEach(song => tracks.push(song));
    }

    delete options.params.playlists;
    return tracks;
  };

  const addTracksToDatabase = async tracksArray => {
    const tracks = [...tracksArray];
    while (tracks[0]) {
      const result = await axios.post(
        url + "api/loadTracksFromPlaylist",
        {
          tracks: tracks.splice(0, 100),
        },
        options
      );
    }
  };

  return {
    sanitizeTracksArray,
    addImagePropertyToLegacyTracks,
    getTracksBulk,
    addTracksToDatabase,
  };
}
