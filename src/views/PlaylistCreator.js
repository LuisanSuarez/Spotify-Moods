import React, { useState } from "react";
import axios from "axios";
import { shuffle } from "lodash";
import styled from "styled-components";

import TagsSelection from "../components/TagsSelection";
import authService from "../services/authService";

const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8880/"
    : "http://localhost:8880/";

const spotifyUrl = "https://api.spotify.com/v1/me/";

const CreatorContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export default function PlaylistCreator({ tags }) {
  const [includedTags, setIncludedTags] = useState([]);
  const [excludedTags, setExcludedTags] = useState([]);

  const tagLabels = tags.map(tag => tag.tag);

  let headers = authService.getHeaders();

  const createPlaylist = async () => {
    const includedSongs = new Set();
    const excludedSongs = new Set();

    for (let i = 0; i < includedTags.length; i++) {
      console.log({ includedTags });
      const tracks = await getTracksFromTag(includedTags[i]);
      tracks.forEach(track => includedSongs.add(track));
    }

    for (let i = 0; i < excludedTags.length; i++) {
      console.log({ excludedTags });
      const tracks = await getTracksFromTag(excludedTags[i]);
      tracks.forEach(track => excludedSongs.add(track));
    }

    console.log({ excludedSongs, includedSongs });

    excludedSongs.forEach(song => includedSongs.delete(song));
    let songs = [...includedSongs];
    songs = shuffle(songs);
    songs = songs.map(uri => "spotify:track:" + uri);

    const uris = { uris: songs };
    console.log({ songs });
    console.log({ uris });
    axios.put(spotifyUrl + "player/play", uris, { headers }).catch(err => {
      console.error({ err });
    });
  };

  const getTracksFromTag = async tag => {
    console.log({ tag });
    const tracks = await axios.get(url + "api/getTracksFromTag", {
      params: { tag: tag },
    });
    console.log({ tracks });
    if (tracks.data[0]) return tracks.data;
    return [];
  };

  const setIncluded = tags => {
    setIncludedTags(tags);
  };

  const setExcluded = tags => {
    setExcludedTags(tags);
  };

  return (
    <CreatorContainer>
      <div style={{ display: "flex" }}>
        <TagsSelection
          options={tagLabels.filter(tag => !excludedTags.includes(tag))}
          type="createPlaylist"
          label="that feels"
          submit={setIncluded}
        />
        <TagsSelection
          options={tagLabels.filter(tag => !includedTags.includes(tag))}
          type="createPlaylist"
          label="but doesn't feel"
          submit={setExcluded}
        />
        <div onClick={createPlaylist}> Show me how it feels</div>
      </div>
      <div>only with/also with button</div>
    </CreatorContainer>
  );
}
