import styled from "styled-components";
import playButton from "../../assets/img/play-button.png";

const PlayContainer = styled.div`
  height: 50px;
  width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default function PlayButton() {
  return (
    <PlayContainer>
      <img src={playButton} style={{ height: "100%", width: "100%" }} />
    </PlayContainer>
  );
}
