import styled from "styled-components";

const TagContainer = styled.div``;

export default function Tag({ tag, deleteTag, editTag, index }) {
  return (
    <TagContainer onClick={() => editTag(index)}>
      {`#${tag}`}
      <div onClick={() => deleteTag(index)}>X</div>
    </TagContainer>
  );
}
