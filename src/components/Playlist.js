import styled from "styled-components";
import { ReactComponent as AlbumPlaceholderSM } from "../assets/img/icon/no-album-sm.svg";
import { ReactComponent as AlbumPlaceholder } from "../assets/img/icon/no-album.svg";
import { COLOR } from "../services/variables";

const PlaylistContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  &:hover {
    background: ${props =>
      props.selected ? COLOR.translucentShade : COLOR.transparentShade};
  }
  width: ${props => SIZES[props.size].containerWidth};
  min-width: 200px;
  margin: ${props => SIZES[props.size].containerMargin};
  background: ${props =>
    props.selected ? COLOR.translucentShade : "transparent"};
`;

const Name = styled.h4`
  display: flex;
  align-items: center;
  margin: ${props => SIZES[props.size].titleMargin};
  font-size: ${props => SIZES[props.size].titleSize};
  color: ${props => (props.selected ? "#000000" : COLOR.thirty)};
`;

const AlbumImage = styled.img`
  width: ${props => SIZES[props.size].width};
  height: ${props => SIZES[props.size].height};
  margin: 2px;
  margin-left: 12px;
`;

const Placeholder = styled.div`
  width: ${props => SIZES[props.size].width};
  height: ${props => SIZES[props.size].height};
  background: #333;
  margin: 2px;
  margin-left: 12px;
`;

const SIZES = {
  md: {
    containerWidth: "80vw",
    containerMargin: "13px 50px 0",
    width: "60px",
    height: "60px",
    titleMargin: "21px 0 21px 16px",
    titleSize: "1rem",
  },
  sm: {
    containerWidth: "40vw",
    containerMargin: "5px 50px 0",
    width: "30px",
    height: "30px",
    titleMargin: "3px 0 3px 16px",
    titleSize: "0.75rem",
  },
};

const placeholderSizePicker = size => {
  let placeholder;
  switch (size) {
    case "sm":
      placeholder = <AlbumPlaceholderSM />;
      break;
    case "md":
      placeholder = <AlbumPlaceholder />;
      break;
    default:
      placeholder = <AlbumPlaceholder />;
  }
  return placeholder;
};

export default function Playlist({ playlist, size = "md" }) {
  const { name, selected } = playlist;
  const image = playlist.images[0]
    ? playlist.images[playlist.images.length - 1].url
    : null;
  return (
    <PlaylistContainer selected={selected} size={size}>
      {image ? (
        <AlbumImage src={image} size={size} />
      ) : (
        <Placeholder size={size}> {placeholderSizePicker(size)} </Placeholder>
      )}
      <Name selected={selected} size={size}>
        {name}
      </Name>
    </PlaylistContainer>
  );
}
