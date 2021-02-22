import axios from "axios";
import { useState } from "react";
import styled from "styled-components";
import { useSongSelection } from "../hooks/SongContext";
import Tags from "./Tags";
import TagsSelection from "./TagsSelection";
import PlayButton from "./utilities/PlayButton";

const TrackContainer = styled.div`
  width: 100%;
  margin: 12px 0;
  height: 8vw;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  overflow: hidden;
  color: #61dafb;
  background-color: lightgray;
  opacity: 0.5;
  transition: opacity ease-in-out 1s;
`;

export default function Track({
  track = { image: "", name: "", uri: "" },
  trackTags,
  tagsCount,
}) {
  const [tags, setTags] = useState(trackTags ? trackTags : []);
  const setSong = useSongSelection();

  const { image, name, uri } = track;

  const url =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8880/"
      : "http://localhost:8880/";

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
      <img src={image} />
      <h1>{name}</h1>
      <Tags tags={tags} deleteTag={deleteTag} editTag={editTag} />

      <TagsSelection
        options={Object.keys(tagsCount)}
        type="addTags"
        label="add new tag"
        submit={handleNewTag}
      />
      <div onClick={() => setSong(uri)}>
        <PlayButton />
      </div>
    </TrackContainer>
  );
}
