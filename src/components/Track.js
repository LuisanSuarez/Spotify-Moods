import axios from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { usePlayingSong } from "../hooks/SongContext";
import { useTags, useTagsUpdating } from "../hooks/TagsContext";
import { COLOR, devUrl, prodUrl } from "../services/variables";
import Tags from "./Tags";
import TagsSelection from "./TagsSelection";
import PlayButton from "./utilities/PlayButton";

const WIDTH = "125px";

const TrackContainer = styled.div`
  width: 100%;
  max-width: 1864px;
  margin: 2px 0;
  height: 60px;
  color: #61dafb;
  background-color: ${COLOR.sixty};
  transition: opacity ease-in-out 1s;
`;

const TrackFocus = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  overflow: hidden;
  background-color: ${props =>
    props.isSelected ? COLOR.translucentShade : "transparent"};
  &:hover {
    background-color: ${props =>
      props.isOnPlayer
        ? "transparent"
        : props.isSelected
        ? COLOR.translucentShade
        : COLOR.transparentShade};
  }
`;

const AlbumImage = styled.img`
  box-sizing: border-box;
  padding: 7px;
  height: 100%;
`;

const TrackInfo = styled.div`
  height: 100%;
  min-width: 125px;
  max-width: 400px;
  width: 22vw;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: flex-start;
  color: ${COLOR.thirty};
  margin-right: 7px;
`;

const SongName = styled.p`
  margin: 0;
  font-size: 1.125rem;
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: start;
`;
const Song = styled.div`
  height: 60%;
  width: 100%;
  box-sizing: border-box;
  padding-top: 4px;
  z-index: 1;
`;
const Artists = styled.div`
  height: 35%;
  align-items: baseline;
  width: 100%;
`;
const ArtistName = styled.p`
  margin: 0;
  margin-top: -4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: start;
`;

const PlayButtonContainer = styled.div`
  margin-left: 7px;
  margin-right: 10px;
  @media (min-width: 960px) {
    margin-left: 2vw;
  }
`;

export default function Track({
  track = { image: "", name: "", uri: "", artists: [] },
  trackTags,
  allTags = [],
  index,
  handlePlay,
  isOnPlayer = false,
}) {
  const [tags, setTags] = useState(trackTags ? trackTags : []);
  const playingSong = usePlayingSong();
  const setContextTags = useTagsUpdating();
  const contextTags = useTags();

  allTags = allTags.map(tag => tag.tag);

  const selectionTags = allTags
    ? allTags.filter(tag => !tags.includes(tag))
    : [];

  let { image, name, uri, artists } = track;
  artists = artists ? artists : [];

  const url = process.env.NODE_ENV === "development" ? devUrl : prodUrl;

  const handleNewTag = async newTag => {
    if (!newTag) return;
    if (tags.includes(newTag)) {
      showTagAlreadyExists();
      return;
    }
    const prevTags = [...tags];
    const newTags = [...tags, newTag];
    const trackId = track.id;
    const result = await axios.post(url + "api/loadTags", {
      newTag,
      newTags,
      trackId,
    });
    setTags(newTags);
    if (result.data.error && result.data.msg === "error-updating") {
      alert("there was an error updating your tags. please try again");
      setTags(prevTags);
    }
  };

  const deleteTag = async deleteIndex => {
    const newTags = [...tags];
    const deletedTag = newTags.splice(deleteIndex, 1)[0];
    const trackId = track.id;

    const result = await axios.post(url + "api/removeTags", {
      deletedTag,
      newTags,
      trackId,
    });

    setTags(newTags);
  };

  useEffect(() => {
    if (contextTags.uri === uri) {
      setContextTags({ tags, uri });
    }
  }, [tags]);

  useEffect(() => {
    if (contextTags.uri === uri && contextTags.tags.length !== tags.length) {
      setTags(contextTags.tags);
    }
  }, [contextTags]);

  const editTag = editIndex => {
    // figure out a way to edit tags
  };

  const showTagAlreadyExists = tag => {
    // put in some nice UX
  };

  return (
    <TrackContainer>
      <TrackFocus
        isSelected={uri === playingSong && !isOnPlayer}
        isOnPlayer={isOnPlayer}
      >
        <AlbumImage src={image} />
        <TrackInfo width={WIDTH}>
          <Song isSelected={uri === playingSong && !isOnPlayer}>
            <SongName width={WIDTH}>{name}</SongName>
          </Song>
          <Artists>
            <ArtistName>
              {artists
                .map(artist => artist.name)
                .join(", ")
                .trim()}
            </ArtistName>
          </Artists>
        </TrackInfo>
        <Tags tags={tags} deleteTag={deleteTag} editTag={editTag} />

        <TagsSelection
          options={selectionTags}
          type="addTags"
          label="add new tag"
          submit={handleNewTag}
        />
        {!isOnPlayer ? (
          <PlayButtonContainer onClick={() => handlePlay({ uri, tags, index })}>
            <PlayButton />
          </PlayButtonContainer>
        ) : (
          ""
        )}
      </TrackFocus>
    </TrackContainer>
  );
}
