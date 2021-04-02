import axios from "axios";
import { useState } from "react";
import styled from "styled-components";
import { useSongSelection } from "../hooks/SongContext";
import { COLOR, devUrl, prodUrl } from "../services/variables";
import Tags from "./Tags";
import TagsSelection from "./TagsSelection";
import PlayButton from "./utilities/PlayButton";

const WIDTH = "175px";

const TrackContainer = styled.div`
  width: 100%;
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
  background-color: transparent;
  &:hover {
    background-color: ${COLOR.transparentShade};
  }
`;

const AlbumImage = styled.img`
  box-sizing: border-box;
  padding: 7px;
  height: 100%;
`;

const TrackInfo = styled.div`
  height: 100%;
  width: ${props => props.width};
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: flex-start;
  color: ${COLOR.thirty};
  margin-right: 7px;
`;

const SongName = styled.p`
  margin: 0;
  font-size: 1.25rem;
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: ${props => props.width};
  text-align: start;
  &:hover {
    width: auto;
    z-index: 1;
  }
`;
const Song = styled.div`
  height: 60%;
  box-sizing: border-box;
  padding-top: 4px;
  &:hover {
    background: rgb(101, 113, 85);
    z-index: 1;
  }
`;
const Artists = styled.div`
  height: 35%;
  align-items: baseline;
`;
const ArtistName = styled.p`
  margin: 0;
  margin-top: -4px;
`;

export default function Track({
  track = { image: "", name: "", uri: "", artists: [] },
  trackTags,
  tagsCount,
}) {
  const [tags, setTags] = useState(trackTags ? trackTags : []);
  const setSong = useSongSelection();

  let { image, name, uri, artists } = track;
  artists = artists ? artists : [];

  const url = process.env.NODE_ENV === "development" ? devUrl : prodUrl;

  const handleNewTag = async newTag => {
    if (!newTag) return;
    const prevTags = [...tags];
    const newTags = [...tags, newTag];
    setTags(newTags);
    const trackId = track.id;
    const result = await axios.post(url + "api/loadTags", {
      newTag,
      newTags,
      trackId,
    });
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

  const editTag = editIndex => {
    console.log("figure out a way to edit tags later");
  };
  return (
    <TrackContainer>
      <TrackFocus>
        <AlbumImage src={image} />
        <TrackInfo width={WIDTH}>
          <Song>
            <SongName width={WIDTH}>{name}</SongName>
          </Song>
          <Artists>
            {artists.map(artist => (
              <ArtistName>{artist.name}</ArtistName>
            ))}
          </Artists>
        </TrackInfo>
        <Tags tags={tags} deleteTag={deleteTag} editTag={editTag} />

        <TagsSelection
          options={Object.keys(tagsCount)}
          type="addTags"
          label="add new tag"
          submit={handleNewTag}
        />
        <div
          style={{ marginLeft: "auto", marginRight: "10px" }}
          onClick={() => setSong(uri)}
        >
          <PlayButton />
        </div>
      </TrackFocus>
    </TrackContainer>
  );
}
