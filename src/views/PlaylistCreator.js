import axios from "axios";
import { shuffle } from "lodash";
import { useState } from "react";
import styled from "styled-components";
import TagsSelection from "../components/TagsSelection";
import Loading from "../components/utilities/Loading";
import Switch from "../components/utilities/Switch";
import { useSongSelection } from "../hooks/SongContext";
import authService from "../services/authService";
import tracksService from "../services/tracksService";
import { COLOR, devUrl, prodUrl, spotifyUrl } from "../services/variables";

const CreatorContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const StartPlaylistDiv = styled.div`
  color: ${COLOR.thirty};
  box-sizing: border-box;
  padding: 10px 20px;
  border: 2px solid ${COLOR.thirty};
  border-radius: 8px;
  &:hover {
    background: ${COLOR.transparentShade};
  }
`;

const InclusiveExclusiveBtn = styled.div`
  display: flex;
  justify-content: flex-start;
  text-align: start;
  padding: 10px 25px 25px;
`;

const ExclusiveText = styled.p`
  background: ${props =>
    props.onlyWithTags ? COLOR.transparentShade : "transparent"};
  transition: background 0.3s ease-out;
  border-radius: 8px;
  box-sizing: border-box;
  padding: 2px 8px 4px;
  margin: 0;
  display: flex;
  align-items: center;
`;

const InclusiveText = styled.p`
  background: ${props =>
    props.onlyWithTags ? "transparent" : COLOR.transparentShade};
  transition: background 0.3s ease-out;
  border-radius: 8px;
  box-sizing: border-box;
  padding: 2px 8px 4px;
  margin: 0;
  display: flex;
  align-items: center;
`;

const EXCLUSIVE = "All of these tags";
const INCLUSIVE = "Any of these tags";

export default function PlaylistCreator({ tags }) {
  const [includedTags, setIncludedTags] = useState([]);
  const [excludedTags, setExcludedTags] = useState([]);
  const [onlyWithTags, setOnlyWithTags] = useState(true);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);

  const url = process.env.NODE_ENV === "development" ? devUrl : prodUrl;

  const setSong = useSongSelection();

  const tagLabels = tags.map(tag => tag.tag);

  let headers = authService().getHeaders();

  const createPlaylist = async () => {
    if (creatingPlaylist) return;
    setCreatingPlaylist(true);
    const includedSongs = new Set();
    const excludedSongs = new Set();

    for (let i = 0; i < includedTags.length; i++) {
      const tracks = await getTracksFromTag(includedTags[i]);
      tracks.forEach(track => includedSongs.add(track));
    }

    for (let i = 0; i < excludedTags.length; i++) {
      const tracks = await getTracksFromTag(excludedTags[i]);
      tracks.forEach(track => excludedSongs.add(track));
    }

    excludedSongs.forEach(song => includedSongs.delete(song));
    let songs = [...includedSongs];
    songs = await filterExclusive(songs, onlyWithTags);
    songs = shuffle(songs);
    songs = songs.map(uri => "spotify:track:" + uri.id);

    startPlaylist(songs);
  };
  const startPlaylist = list => {
    const deviceId = sessionStorage.getItem("deviceId");
    const uris = { uris: list };
    const params = { device_id: deviceId };

    axios
      .put(spotifyUrl + "player/play", uris, { headers, params })
      .catch(err => {
        if (err.response.status === "404") console.error({ err });
      })
      .finally(() => {
        setCreatingPlaylist(false);
      });
  };
  const filterExclusive = async (songs, shouldFilter) => {
    const tracksWithTags = await tracksService().getTracksBulk(songs);
    if (!shouldFilter) return tracksWithTags;
    const hasAllTags = song => {
      const response = includedTags.every(tag => song.tags.includes(tag));
      return response;
    };

    const filteredTracks = tracksWithTags.filter(hasAllTags);
    return filteredTracks;
  };
  const getTracksFromTag = async tag => {
    const tracks = await axios.get(url + "api/getTracksFromTag", {
      params: { tag: tag },
    });
    if (tracks.data[0]) return tracks.data;
    return [];
  };

  const setIncluded = tags => {
    setIncludedTags(tags);
  };

  const setExcluded = tags => {
    setExcludedTags(tags);
  };

  const handleSwitch = () => {
    setOnlyWithTags(!onlyWithTags);
  };

  return (
    <CreatorContainer>
      <Controls>
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
        <StartPlaylistDiv onClick={createPlaylist}>
          {creatingPlaylist ? <Loading /> : "Show me how it feels"}
        </StartPlaylistDiv>
      </Controls>
      <InclusiveExclusiveBtn>
        <InclusiveText onlyWithTags={onlyWithTags}>{INCLUSIVE}</InclusiveText>
        <div onClick={handleSwitch}>
          <Switch label="" />
        </div>
        <ExclusiveText onlyWithTags={onlyWithTags}>{EXCLUSIVE}</ExclusiveText>
      </InclusiveExclusiveBtn>
    </CreatorContainer>
  );
}
