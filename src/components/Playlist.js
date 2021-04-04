import styled from "styled-components";
import { ReactComponent as AlbumPlaceholder } from "../assets/img/icon/no-album.svg";

const AlbumImage = styled.img`
  width: 60px;
  height: 60px;
`;

const Placeholder = styled.div`
  width: 60px;
  height: 60px;
  background: #333;
  margin: 0 auto;
`;

export default function Playlist({ playlist }) {
  if (playlist.name.split(" ").includes("Drum")) {
    console.log({ playlist });
    console.log(playlist.images[playlist.images.length - 1]);
  }

  const { name } = playlist;
  const image = playlist.images[0]
    ? playlist.images[playlist.images.length - 1].url
    : null;
  return (
    <div>
      <h4>{playlist.name}</h4>
      {image ? (
        <AlbumImage src={image} />
      ) : (
        <Placeholder>
          {" "}
          <AlbumPlaceholder />{" "}
        </Placeholder>
      )}
      <input type="checkbox" checked={playlist.selected}></input>
    </div>
  );
}
