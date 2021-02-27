import axios from "axios";
import { useEffect } from "react";
import { spotifyUrl } from "../services/variables";

function Playlist() {
  // const spotifyUrl = "https://api.spotify.com/v1/me/";
  const limit = "?limit=50";
  const moodsPlaylistName = "Por escuchar".toLowerCase();

  // axios.defaults.withCredentials = false;

  useEffect(async () => {
    let requestUrl = spotifyUrl + "playlists" + limit;
    const tokens = JSON.parse(localStorage.getItem("tokens"));
    const headers = {
      authorization: "Bearer " + tokens.access_token,
    };
    let playlists;
    let moodsPlaylistId;
    do {
      playlists = await axios.get(requestUrl, { headers });
      moodsPlaylistId = playlists.data.items.filter(playlist => {
        return playlist.name.toLowerCase() === moodsPlaylistName;
      });
      requestUrl = playlists.data.next;
    } while (playlists.data.next && !moodsPlaylistId.length);

    moodsPlaylistId = moodsPlaylistId[0] ? moodsPlaylistId[0].id : null;

    requestUrl =
      spotifyUrl.slice(0, spotifyUrl.length - 3) +
      "playlists/" +
      moodsPlaylistId;

    let moodsPlaylist = [];
    let playlistResponse;
    while (requestUrl) {
      playlistResponse = await axios.get(requestUrl, { headers });
      if (playlistResponse.data.tracks) {
        moodsPlaylist = moodsPlaylist.concat(
          playlistResponse.data.tracks.items
        );
        requestUrl = playlistResponse.data.tracks.next;
      } else {
        requestUrl = null;
      }
    }
  }, []);
  return (
    <div>
      <h1>Playlist</h1>
    </div>
  );
}

export default Playlist;
