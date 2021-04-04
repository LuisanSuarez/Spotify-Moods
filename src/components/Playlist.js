import styled from "styled-components";
import { ReactComponent as AlbumPlaceholder } from "../assets/img/icon/no-album.svg";
import { COLOR } from "../services/variables";

const PlaylistContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  &:hover {
    background: ${props =>
      props.selected ? COLOR.translucentShade : COLOR.transparentShade};
  }
  width: 80vw;
  min-width: 200px;
  margin: 13px 50px 0;
  background: ${props =>
    props.selected ? COLOR.translucentShade : "transparent"};
`;

const Name = styled.h4`
  margin-left: 16px;
`;

const AlbumImage = styled.img`
  width: 60px;
  height: 60px;
  margin: auto 0;
  margin-left: 12px;
`;

const Placeholder = styled.div`
  width: 60px;
  height: 60px;
  background: #333;
  margin: auto 0;
  margin-left: 12px;
`;

export default function Playlist({ playlist }) {
  const { name, selected } = playlist;
  const image = playlist.images[0]
    ? playlist.images[playlist.images.length - 1].url
    : null;
  return (
    <PlaylistContainer selected={selected}>
      {image ? (
        <AlbumImage src={image} />
      ) : (
        <Placeholder>
          {" "}
          <AlbumPlaceholder />{" "}
        </Placeholder>
      )}
      <Name>{name}</Name>
    </PlaylistContainer>
  );
}
