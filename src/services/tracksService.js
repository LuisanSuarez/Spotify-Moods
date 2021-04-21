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

// module.exports = tracksService();
// Vercel deploys fail if we export using modules

// const sanitizeTracksObject = rawTracks => {
//   const tracks = {};
//   rawTracks.forEach(trackData => {
//     const track = trackData.track;
//     const trackObj = {
//       albumName: "",
//       albumImages: [],
//       artists: [],
//       name: "",
//       uri: "",
//       id: "",
//       tags: [],
//     };
//     trackObj.albumName = track.album.name;
//     trackObj.albumImages = track.album.images;
//     trackObj.artists = track.artists;
//     trackObj.name = track.name;
//     trackObj.uri = track.uri;
//     trackObj.id = track.id;

//     tracks[track.id] = trackObj;
//   });

//   return tracks;
// };

// const sanitizeSongs = rawTracks => {
//   const tracks = {};
//   rawTracks.forEach(trackData => {
//     const track = trackData.track;
//     const trackObj = {
//       albumName: "",
//       albumImages: [],
//       artists: [],
//       name: "",
//       uri: "",
//       id: "",
//       tags: [],
//     };
//     trackObj.albumName = track.album.name;
//     trackObj.albumImages = track.album.images;
//     trackObj.artists = track.artists;
//     trackObj.name = track.name;
//     trackObj.uri = track.uri;
//     trackObj.id = track.id;

//     tracks[track.id] = trackObj;
//   });

//   return tracks;
// };

// const updateTracks = async () => {
//   // set a daily limit

//   // get savedTracks from spotify
//   const spotifyTracksArray = await getTracksFromSpotify();

//   const spotifyTracksObject = {};
//   spotifyTracksArray.forEach(track => {
//     spotifyTracksObject[track.id] = track;
//   });

//   const spotifyTracksIds = spotifyTracksArray.map(track => track.id);

//   // get savedTraccks from mongodb
//   const dbTracksArray = await getTracksFromDatabase();
//   const dbTracksObject = {};
//   dbTracksArray.forEach(track => (dbTracksObject[track.id] = tracks));

//   const dbTracksIds = dbTracksArray.map(track => track.id);
//   // find which songs are now added
//   // find which songs are now deleted
//   let addedTracksIds = new Set(spotifyTracksIds);
//   let removedTracksIds = new Set(dbTracksIds);

//   spotifyTracksIds.forEach(trackId => {
//     if (removedTracksIds.delete(trackId)) {
//       delete dbTracksObject[trackId];
//     }
//   });
//   dbTracksIds.forEach(trackId => {
//     if (addedTracksIds.delete(trackId)) {
//       delete spotifyTracksObject[trackId];
//     }
//   });

//   console.log({ addedTracksIds, removedTracksIds });

//   addedTracksIds = [...addedTracksIds];
//   removedTracksIds = [...removedTracksIds];
//   const addedTracks = addedTracksIds.map(
//     trackId => spotifyTracksObject[trackId]
//   );
//   const removedTracks = removedTracksIds.map(
//     trackId => dbTracksObject[trackId]
//   );

//   console.log({ addedTracks, addedTracksIds, removedTracksIds });
//   // add new songs to database

//   addTracksToDatabase(addedTracks);
//   removeTracksFromDatabase(removedTracks);
//   // remove disliked songs from database
//   //   remove them from the allSongs collection
//   //   remove them from all the tags they're placed in
// };

// const removeTracksFromDatabase = async tracks => {
//   const result = await axios.post(url + "api/remove", { tracks });
//   console.log("remove old tracks", { result });
// };

// const addTracksToDatabase = async tracks => {
//   const result = await axios.post(url + "api/loadTracks", { tracks });
//   console.log({ result });
// };
